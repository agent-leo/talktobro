# Allowlist Worker Spec (Post-Payment)

## Purpose
Convert paid users into OpenClaw WhatsApp allowlist entries safely and audibly.

## Input
`allowlist_queue` rows where:
- `status='pending'`

Fields:
- `user_id`
- `phone`
- `source`
- `reason`

## Worker steps
1. Fetch next pending row (FIFO).
2. Normalise phone into canonical E.164 and local variants if needed.
3. Patch OpenClaw config allowlists (top-level + account-level as required).
4. Restart/apply config safely.
5. Mark queue row:
   - success -> `status='processed'`, `processed_at=now()`
   - failure -> `status='failed'`, store error in `reason`

## Safety rules
- Idempotent updates (no duplicate allowlist entries).
- Never open policies (keep `dmPolicy/groupPolicy = allowlist`).
- Do not touch unrelated channels/accounts.

## Observability
- Log each queue id + phone + result
- Emit alert when same queue row fails >3 times
- Daily report: pending/processed/failed counts
