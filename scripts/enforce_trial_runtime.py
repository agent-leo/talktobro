#!/usr/bin/env python3
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import requests

WORKSPACE = Path('/Users/benaiahwillis/.openclaw/workspace')
CONFIG_PATH = Path('/Users/benaiahwillis/.openclaw/openclaw.json')
ENV_PATH = WORKSPACE / 'talktobro' / '.env'
UNIFIED_DIR = WORKSPACE / 'memory' / 'unified'


def load_env(path: Path):
    out = {}
    if not path.exists():
        return out
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def headers(key: str):
    return {
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
    }


def now_utc():
    return datetime.now(timezone.utc)


def parse_iso(ts: str):
    return datetime.fromisoformat(ts.replace('Z', '+00:00'))


def normalize_variants(phone: str):
    p = re.sub(r'\s+|-', '', str(phone or ''))
    if not p:
        return []
    if not p.startswith('+'):
        if p.startswith('0'):
            p = '+44' + p[1:]
        else:
            p = '+' + p
    digits = re.sub(r'\D', '', p)
    vals = [p, digits]
    if digits.startswith('44'):
        vals.append('0' + digits[2:])
    seen = set()
    out = []
    for v in vals:
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out


def count_messages(base: str, key: str, trial_id: str, channel: str, contact_value: str, started_at: datetime):
    # Primary path: count structured trial_message_events
    started = started_at.isoformat().replace('+00:00', 'Z')
    contact = requests.utils.quote(str(contact_value), safe='')
    r = requests.get(
        f"{base}/rest/v1/trial_message_events?select=id&channel=eq.{channel}&contact_value=eq.{contact}&direction=eq.user&event_at=gte.{started}",
        headers={**headers(key), 'Prefer': 'count=exact'},
        timeout=20,
    )
    if r.status_code < 400:
        count = r.headers.get('Content-Range', '0-0/0').split('/')[-1]
        try:
            return int(count)
        except Exception:
            pass

    # Fallback: legacy log-derived counting
    if not UNIFIED_DIR.exists():
        return 0
    needle = str(contact_value)
    variants = normalize_variants(contact_value) if channel == 'whatsapp' else [needle]
    total = 0
    for f in sorted(UNIFIED_DIR.glob('*.md')):
        text = f.read_text(errors='ignore')
        for line in text.splitlines():
            low = line.lower()
            if f'[{channel}]' not in low:
                continue
            if not any(v in line for v in variants):
                continue
            total += 1
    return total


def remove_from_config(cfg: dict, channel: str, contact_value: str):
    changed = False
    channels = cfg.setdefault('channels', {})

    if channel == 'telegram':
        tg = channels.setdefault('telegram', {})
        allow = tg.setdefault('allowFrom', [])
        try:
            val = int(str(contact_value))
        except Exception:
            return False
        if val in allow:
            allow.remove(val)
            changed = True
        return changed

    wa = channels.setdefault('whatsapp', {})
    variants = normalize_variants(contact_value)
    for key in ('allowFrom', 'groupAllowFrom'):
        arr = wa.setdefault(key, [])
        before = len(arr)
        arr[:] = [x for x in arr if str(x) not in variants]
        changed = changed or len(arr) != before
    leo = wa.setdefault('accounts', {}).setdefault('leo', {})
    leo_arr = leo.setdefault('groupAllowFrom', [])
    before = len(leo_arr)
    leo_arr[:] = [x for x in leo_arr if str(x) not in variants]
    changed = changed or len(leo_arr) != before
    return changed


def patch_trial(base: str, key: str, row_id: str, status: str, notes: str):
    r = requests.patch(
        f"{base}/rest/v1/trial_access?id=eq.{row_id}",
        headers={**headers(key), 'Prefer': 'return=minimal'},
        json={'status': status, 'notes': notes, 'updated_at': now_utc().isoformat()},
        timeout=20,
    )
    r.raise_for_status()


def main():
    env = load_env(ENV_PATH)
    base = env.get('VITE_SUPABASE_URL')
    key = env.get('SUPABASE_SERVICE_ROLE_KEY')
    if not base or not key:
        raise SystemExit('Missing supabase env values')

    r = requests.get(
        f"{base}/rest/v1/trial_access?status=eq.active&select=id,channel,contact_value,started_at,expires_at,message_limit",
        headers=headers(key),
        timeout=20,
    )
    r.raise_for_status()
    rows = r.json()
    if not rows:
        print('No active trials')
        return

    cfg = json.loads(CONFIG_PATH.read_text())
    cfg_changed = False

    for row in rows:
        rid = row['id']
        channel = (row.get('channel') or 'whatsapp').lower()
        contact = str(row.get('contact_value') or '')
        expires_at = parse_iso(row['expires_at'])
        started = parse_iso(row['started_at'])
        limit = int(row.get('message_limit') or 20)

        if now_utc() >= expires_at:
            if remove_from_config(cfg, channel, contact):
                cfg_changed = True
            patch_trial(base, key, rid, 'expired', 'trial expired and access removed')
            continue

        used = count_messages(base, key, rid, channel, contact, started)
        if used >= limit:
            if remove_from_config(cfg, channel, contact):
                cfg_changed = True
            patch_trial(base, key, rid, 'capped', f'message cap hit ({used}/{limit}); access removed')

    if cfg_changed:
        CONFIG_PATH.write_text(json.dumps(cfg, indent=2))
        subprocess.run(['openclaw', 'gateway', 'restart'], check=False)

    print('Trial runtime enforcement complete')


if __name__ == '__main__':
    main()
