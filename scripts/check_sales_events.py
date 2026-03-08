#!/usr/bin/env python3
import json
import os
from pathlib import Path
from datetime import datetime, timezone, timedelta
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
STATE_PATH = ROOT / "scripts" / ".sales_event_state.json"
ENV_PATH = ROOT / ".env"


def load_env(path: Path):
    env = {}
    if not path.exists():
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        k, v = line.split('=', 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def iso_now():
    return datetime.now(timezone.utc)


def parse_iso(s: str):
    return datetime.fromisoformat(s.replace('Z', '+00:00'))


def get_json(url: str, headers: dict):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode('utf-8'))


def main():
    env = load_env(ENV_PATH)
    supabase_url = env.get('VITE_SUPABASE_URL')
    service_key = env.get('SUPABASE_SERVICE_ROLE_KEY')
    if not supabase_url or not service_key:
        print('ERROR: missing supabase env keys')
        return 2

    if STATE_PATH.exists():
        state = json.loads(STATE_PATH.read_text())
        last_check = parse_iso(state.get('last_check'))
    else:
        last_check = iso_now() - timedelta(minutes=30)

    now = iso_now()
    since = last_check.isoformat()

    headers = {
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
    }

    q_since = since.replace('+00:00', 'Z')

    onboarding_url = (
        f"{supabase_url}/rest/v1/onboarding_intakes"
        f"?select=id,name,preferred_channel,phone,telegram_handle,telegram_user_id,goals,created_at"
        f"&created_at=gt.{q_since}&order=created_at.asc"
    )

    subs_url = (
        f"{supabase_url}/rest/v1/subscriptions"
        f"?select=id,user_id,status,plan,stripe_checkout_session_id,updated_at,created_at"
        f"&status=eq.active&updated_at=gt.{q_since}&order=updated_at.asc"
    )

    try:
        onboard_rows = get_json(onboarding_url, headers)
        sub_rows = get_json(subs_url, headers)
    except Exception as e:
        print(f'ERROR: {e}')
        return 2

    lines = []
    for r in onboard_rows:
        contact = r.get('phone') or r.get('telegram_handle') or r.get('telegram_user_id') or 'unknown'
        lines.append(
            f"🟢 New trial signup: {r.get('name') or 'Unknown'} | {r.get('preferred_channel') or 'channel?'} | {contact} | {r.get('created_at')}"
        )

    for r in sub_rows:
        lines.append(
            f"💳 New paying client: user {r.get('user_id')} | plan {r.get('plan')} | status {r.get('status')} | {r.get('updated_at')}"
        )

    STATE_PATH.write_text(json.dumps({'last_check': now.isoformat()}, indent=2))

    if not lines:
        print('NO_EVENTS')
    else:
        print('\n'.join(lines))

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
