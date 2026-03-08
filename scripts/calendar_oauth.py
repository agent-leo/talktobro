#!/usr/bin/env python3
"""
Google Calendar OAuth flow for TalkToBro booking.
Writes token JSON to workspace memory/calendar_token.json
"""

import os
import sys
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/calendar',
]

WORKSPACE = Path('/Users/benaiahwillis/.openclaw/workspace')
CREDENTIALS_FILE = Path.home() / 'Desktop' / 'client_secret_1006764688609-2fi6oganeq5vlbsb0btqn28i685rqds5.apps.googleusercontent.com.json'
TOKEN_FILE = WORKSPACE / 'memory' / 'calendar_token.json'


def main():
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                print(f'ERROR: credentials file missing: {CREDENTIALS_FILE}')
                sys.exit(1)

            flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)

        TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        TOKEN_FILE.write_text(creds.to_json())

    print(f'OK: token saved to {TOKEN_FILE}')
    print('Scopes:', creds.scopes)


if __name__ == '__main__':
    main()
