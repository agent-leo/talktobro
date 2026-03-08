# Telegram Provisioning — Phase 1 (Safe Rollout)

## What is live now
- Onboarding captures preferred channel (`whatsapp` or `telegram`).
- Telegram handle is captured in onboarding intake when selected.
- Stripe webhook stores channel + contact value in `allowlist_queue`.
- Queue worker currently auto-processes WhatsApp only.
- Telegram queue rows are marked `failed: unsupported channel` (intentional safety guard).

## Why this guard exists
Telegram provisioning requires verified Telegram `user_id`/`chat_id` before allowlisting.
A plain `@handle` is not sufficient for secure routing.

## Next implementation (Phase 2)
1. Add `/start` + `/link <code>` Telegram linking flow
2. Resolve Telegram user id from inbound bot message
3. Store verified telegram id in `profiles` and queue `contact_value`
4. Extend allowlist worker to process `channel=telegram`
5. Add telemetry dashboard state: pending_verification / verified / allowlisted

## Principle
No client should ever be added to runtime allowlists without channel identity verification.
