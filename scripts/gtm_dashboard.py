#!/usr/bin/env python3
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT / '.env'
LEAD_STATE = ROOT.parent / 'memory' / 'lead_state.json'


def load_env(path):
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


def get_json(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read().decode())


def main():
    env = load_env(ENV)
    sb_url = env.get('VITE_SUPABASE_URL')
    key = env.get('SUPABASE_SERVICE_ROLE_KEY')

    now = datetime.now(timezone.utc)
    since_24h = (now - timedelta(hours=24)).isoformat().replace('+00:00', 'Z')
    since_7d = (now - timedelta(days=7)).isoformat().replace('+00:00', 'Z')

    trials_24h = 0
    paid_24h = 0
    trials_7d = 0
    paid_7d = 0

    if sb_url and key:
        headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}
        trials_24h_rows = get_json(
            f"{sb_url}/rest/v1/onboarding_intakes?select=id&created_at=gt.{since_24h}", headers
        )
        paid_24h_rows = get_json(
            f"{sb_url}/rest/v1/subscriptions?select=id&status=eq.active&updated_at=gt.{since_24h}", headers
        )
        trials_7d_rows = get_json(
            f"{sb_url}/rest/v1/onboarding_intakes?select=id&created_at=gt.{since_7d}", headers
        )
        paid_7d_rows = get_json(
            f"{sb_url}/rest/v1/subscriptions?select=id&status=eq.active&updated_at=gt.{since_7d}", headers
        )
        trials_24h = len(trials_24h_rows)
        paid_24h = len(paid_24h_rows)
        trials_7d = len(trials_7d_rows)
        paid_7d = len(paid_7d_rows)

    lead_counts = {}
    if LEAD_STATE.exists():
        data = json.loads(LEAD_STATE.read_text())
        lead_counts = data.get('metrics', {}).get('by_stage', {})

    conv_7d = (paid_7d / trials_7d * 100) if trials_7d else 0

    print('📈 TalkToBro GTM Dashboard')
    print(f'UTC now: {now.isoformat()}')
    print(f'Trials (24h): {trials_24h}')
    print(f'New paid (24h): {paid_24h}')
    print(f'Trials (7d): {trials_7d}')
    print(f'Paid (7d): {paid_7d}')
    print(f'Trial→Paid (7d): {conv_7d:.1f}%')
    if lead_counts:
        print('Trello pipeline stages:')
        for k, v in lead_counts.items():
            print(f'  - {k}: {v}')


if __name__ == '__main__':
    main()
