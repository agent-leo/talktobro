#!/usr/bin/env python3
"""
TalkToBro GWS meet pipeline
- create Google Calendar event with Meet link
- optionally invite attendee
- optionally draft follow-up email

Usage:
  python3 talktobro/scripts/gws_meet_pipeline.py \
    --name "John" --email john@example.com \
    --start "2026-03-06T15:00:00+00:00" --end "2026-03-06T15:30:00+00:00" \
    --goal "Discuss TalkToBro fit" --create-followup-draft
"""

import argparse
import base64
import json
import subprocess
import sys

CALENDAR_ID = 'benaiah@agentiveai.consulting'


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{p.stderr or p.stdout}")
    return p.stdout


def create_event(name: str, email: str, start: str, end: str, goal: str):
    summary = f"TalkToBro fit call — {name}"
    description = (
        f"Goal: {goal}\n"
        "Agenda:\n"
        "1) Current workflow + pain points\n"
        "2) Where Bro can save time immediately\n"
        "3) Next steps\n"
    )

    body = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': start},
        'end': {'dateTime': end},
        'attendees': [{'email': email}] if email else [],
        'conferenceData': {
            'createRequest': {
                'requestId': f'talktobro-{start}-{name}'.replace(':', '').replace('+', '').replace(' ', '-'),
                'conferenceSolutionKey': {'type': 'hangoutsMeet'},
            }
        },
    }

    out = run([
        'gws', 'calendar', 'events', 'insert',
        '--params', json.dumps({'calendarId': CALENDAR_ID, 'conferenceDataVersion': 1, 'sendUpdates': 'all'}),
        '--json', json.dumps(body),
    ])
    data = json.loads(out)
    return data


def create_followup_draft(name: str, email: str, meet_link: str, start: str):
    subject = f"TalkToBro call confirmed — {start}"
    body = f"""Hi {name},

Great to connect.

Your TalkToBro call is booked:
- Time: {start}
- Meet link: {meet_link}

Agenda:
1) Your current workflow
2) Where Bro saves time immediately
3) Next steps to get you live

If anything changes, just reply to this email.

Best,
Benaiah
"""

    rfc822 = f"To: {email}\nSubject: {subject}\nContent-Type: text/plain; charset=UTF-8\n\n{body}"
    raw = base64.urlsafe_b64encode(rfc822.encode('utf-8')).decode('utf-8').rstrip('=')

    out = run([
        'gws', 'gmail', 'users', 'drafts', 'create',
        '--params', json.dumps({'userId': 'me'}),
        '--json', json.dumps({'message': {'raw': raw}}),
    ])
    return json.loads(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--name', required=True)
    ap.add_argument('--email', default='')
    ap.add_argument('--start', required=True, help='ISO datetime with timezone')
    ap.add_argument('--end', required=True, help='ISO datetime with timezone')
    ap.add_argument('--goal', default='Discuss TalkToBro fit')
    ap.add_argument('--create-followup-draft', action='store_true')
    args = ap.parse_args()

    event = create_event(args.name, args.email, args.start, args.end, args.goal)
    meet_link = event.get('hangoutLink') or event.get('conferenceData', {}).get('entryPoints', [{}])[0].get('uri') or ''

    result = {
        'ok': True,
        'eventId': event.get('id'),
        'htmlLink': event.get('htmlLink'),
        'meetLink': meet_link,
    }

    if args.create_followup_draft and args.email:
        try:
            draft = create_followup_draft(args.name, args.email, meet_link, args.start)
            result['followupDraft'] = draft
        except Exception as e:
            result['followupDraftError'] = str(e)

    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(json.dumps({'ok': False, 'error': str(e)}, indent=2))
        sys.exit(1)
