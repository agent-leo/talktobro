#!/usr/bin/env python3
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import requests

WORKSPACE = Path('/Users/benaiahwillis/.openclaw/workspace')
OPENCLAW_CONFIG = Path('/Users/benaiahwillis/.openclaw/openclaw.json')
ENV_FILE = WORKSPACE / 'talktobro' / '.env'


def load_env(path: Path):
    vals = {}
    if not path.exists():
        return vals
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        vals[k.strip()] = v.strip().strip('"').strip("'")
    return vals


def normalize_variants(phone: str):
    p = re.sub(r'\s+|-', '', phone or '')
    if not p:
        return []
    if not p.startswith('+'):
        if p.startswith('0'):
            p = '+44' + p[1:]
        else:
            p = '+' + p
    digits = re.sub(r'\D', '', p)
    out = [p, digits]
    if digits.startswith('44'):
        out.append('0' + digits[2:])
    # de-dupe keep order
    seen = set()
    uniq = []
    for x in out:
        if x and x not in seen:
            seen.add(x)
            uniq.append(x)
    return uniq


def supabase_headers(service_role_key: str):
    return {
        'apikey': service_role_key,
        'Authorization': f'Bearer {service_role_key}',
        'Content-Type': 'application/json',
    }


def mark_row(base_url: str, service_role_key: str, row_id: str, status: str, reason: str | None = None):
    payload = {
        'status': status,
        'processed_at': datetime.now(timezone.utc).isoformat(),
    }
    if reason:
        payload['reason'] = reason[:500]

    r = requests.patch(
        f"{base_url}/rest/v1/allowlist_queue?id=eq.{row_id}",
        headers={**supabase_headers(service_role_key), 'Prefer': 'return=minimal'},
        json=payload,
        timeout=20,
    )
    r.raise_for_status()


def add_unique(target_list, values):
    changed = False
    for v in values:
        if v not in target_list:
            target_list.append(v)
            changed = True
    return changed


def main():
    env = load_env(ENV_FILE)
    supabase_url = env.get('VITE_SUPABASE_URL')
    service_role_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    if not supabase_url or not service_role_key:
        raise SystemExit('Missing Supabase URL or service role key in talktobro/.env')

    q = requests.get(
        f"{supabase_url}/rest/v1/allowlist_queue?status=eq.pending&select=id,user_id,phone,channel,contact_value&order=created_at.asc&limit=50",
        headers=supabase_headers(service_role_key),
        timeout=20,
    )
    q.raise_for_status()
    rows = q.json()

    if not rows:
        print('No pending allowlist rows.')
        return

    cfg = json.loads(OPENCLAW_CONFIG.read_text())
    channels = cfg.setdefault('channels', {})

    wa = channels.setdefault('whatsapp', {})
    wa.setdefault('allowFrom', [])
    wa.setdefault('groupAllowFrom', [])
    accounts = wa.setdefault('accounts', {})
    leo = accounts.setdefault('leo', {})
    leo.setdefault('groupAllowFrom', [])

    tg = channels.setdefault('telegram', {})
    tg.setdefault('allowFrom', [])

    changed = False
    processed = 0

    for row in rows:
        row_id = row.get('id')
        try:
            channel = (row.get('channel') or 'whatsapp').lower()
            source_value = str(row.get('contact_value') or row.get('phone', '')).strip()

            if channel == 'telegram':
                if not re.fullmatch(r'\d{5,20}', source_value):
                    mark_row(supabase_url, service_role_key, row_id, 'failed', 'invalid telegram user id')
                    continue
                tg_value = int(source_value)
                c = add_unique(tg['allowFrom'], [tg_value])
                changed = changed or c
                mark_row(supabase_url, service_role_key, row_id, 'processed', 'telegram allowlist synced')
                processed += 1
                continue

            if channel != 'whatsapp':
                mark_row(supabase_url, service_role_key, row_id, 'failed', f'unsupported channel: {channel}')
                continue

            variants = normalize_variants(source_value)
            if not variants:
                mark_row(supabase_url, service_role_key, row_id, 'failed', 'invalid phone/contact')
                continue

            c1 = add_unique(wa['allowFrom'], variants)
            c2 = add_unique(wa['groupAllowFrom'], variants)
            c3 = add_unique(leo['groupAllowFrom'], variants)
            changed = changed or c1 or c2 or c3

            mark_row(supabase_url, service_role_key, row_id, 'processed', 'whatsapp allowlist synced')
            processed += 1
        except Exception as e:
            try:
                mark_row(supabase_url, service_role_key, row_id, 'failed', str(e))
            except Exception:
                pass

    if changed:
        OPENCLAW_CONFIG.write_text(json.dumps(cfg, indent=2))
        subprocess.run(['openclaw', 'gateway', 'restart'], check=False)

    print(f'Processed rows: {processed}; config changed: {changed}')


if __name__ == '__main__':
    main()
