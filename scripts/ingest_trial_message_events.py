#!/usr/bin/env python3
import hashlib
import os
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

WORKSPACE = Path('/Users/benaiahwillis/.openclaw/workspace')
ENV_PATH = WORKSPACE / 'talktobro' / '.env'
UNIFIED_DIR = WORKSPACE / 'memory' / 'unified'
LONDON = ZoneInfo('Europe/London')
UTC = ZoneInfo('UTC')


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
        'Prefer': 'resolution=merge-duplicates',
    }


def parse_blocks(text: str, date_yyyy_mm_dd: str):
    lines = text.splitlines()
    events = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r'^##\s+(user|assistant)\s+\((\d{2}:\d{2}:\d{2})\)\s+\[(\w+)\]', line.strip())
        if not m:
            i += 1
            continue
        role, hhmmss, channel = m.groups()
        channel = channel.lower()
        contact_value = None
        message_id = None

        j = i + 1
        while j < len(lines) and not lines[j].startswith('## '):
            l = lines[j].strip()
            if l.startswith('- from:') or l.startswith('- to:'):
                # examples: - from: telegram:6215854397 (Benaiah Willis)
                mm = re.search(r':\s*(telegram|whatsapp):([^\s\)]+)', l)
                if mm:
                    ch, val = mm.groups()
                    if ch == channel:
                        contact_value = val.strip()
            if l.startswith('- messageId:'):
                message_id = l.split(':', 1)[1].strip()
            j += 1

        if role == 'user' and channel in ('telegram', 'whatsapp') and contact_value:
            local_dt = datetime.fromisoformat(f'{date_yyyy_mm_dd}T{hhmmss}').replace(tzinfo=LONDON)
            event_at = local_dt.astimezone(UTC).isoformat()
            raw = f'{date_yyyy_mm_dd}|{hhmmss}|{channel}|{contact_value}|{message_id or ""}'
            event_hash = hashlib.sha256(raw.encode()).hexdigest()
            events.append({
                'channel': channel,
                'contact_value': contact_value,
                'message_id': message_id,
                'direction': 'user',
                'event_at': event_at,
                'event_hash': event_hash,
                'raw_line': raw,
            })
        i = j
    return events


def fetch_active_trials(base: str, key: str):
    r = requests.get(
        f"{base}/rest/v1/trial_access?status=eq.active&select=id,channel,contact_value,started_at,expires_at",
        headers={k: v for k, v in headers(key).items() if k != 'Prefer'},
        timeout=20,
    )
    r.raise_for_status()
    rows = r.json()
    out = {}
    for row in rows:
        out.setdefault((row['channel'], str(row['contact_value'])), []).append(row)
    return out


def attach_trial(events, trials):
    for e in events:
        key = (e['channel'], str(e['contact_value']))
        trial_id = None
        if key in trials:
            evt = datetime.fromisoformat(e['event_at'])
            for t in trials[key]:
                start = datetime.fromisoformat(t['started_at'].replace('Z', '+00:00'))
                end = datetime.fromisoformat(t['expires_at'].replace('Z', '+00:00'))
                if start <= evt <= end:
                    trial_id = t['id']
                    break
        e['trial_id'] = trial_id


def main():
    env = load_env(ENV_PATH)
    base = env.get('VITE_SUPABASE_URL')
    key = env.get('SUPABASE_SERVICE_ROLE_KEY')
    if not base or not key:
        raise SystemExit('Missing supabase env values')

    if not UNIFIED_DIR.exists():
        print('No unified directory')
        return

    all_events = []
    for file in sorted(UNIFIED_DIR.glob('*.md')):
        date = file.stem
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except Exception:
            continue
        all_events.extend(parse_blocks(file.read_text(errors='ignore'), date))

    if not all_events:
        print('No events parsed')
        return

    trials = fetch_active_trials(base, key)
    attach_trial(all_events, trials)

    # upsert in batches
    batch = 500
    inserted = 0
    for i in range(0, len(all_events), batch):
        chunk = all_events[i:i + batch]
        r = requests.post(
            f"{base}/rest/v1/trial_message_events?on_conflict=event_hash",
            headers=headers(key),
            json=chunk,
            timeout=30,
        )
        r.raise_for_status()
        inserted += len(chunk)

    print(f'Ingested/upserted {inserted} trial message events')


if __name__ == '__main__':
    main()
