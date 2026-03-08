# Supabase Migration + Stripe Webhook Runbook

## Goal
Activate production enforcement for onboarding, subscription state, and allowlist queue.

## Preconditions
- Supabase CLI installed
- Logged in (`supabase login`)
- Project ref: `savyfnvkjnfmqqtjjnci`
- Repo root: `talktobro/`

## 1) Authenticate
```bash
supabase login
supabase projects list
```

## 2) Apply DB migration
```bash
cd /Users/benaiahwillis/.openclaw/workspace/talktobro
supabase db push --project-ref savyfnvkjnfmqqtjjnci
```

### Expected new tables
- `profiles`
- `subscriptions`
- `onboarding_intakes`
- `allowlist_queue`

## 3) Set function secrets (only if missing)
```bash
supabase secrets set \
  STRIPE_SECRET_KEY=... \
  STRIPE_WEBHOOK_SECRET=... \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  --project-ref savyfnvkjnfmqqtjjnci
```

## 4) Deploy webhook function
```bash
supabase functions deploy stripe-webhook --project-ref savyfnvkjnfmqqtjjnci
```

## 5) Wire Stripe webhook endpoint
Endpoint format:
`https://savyfnvkjnfmqqtjjnci.supabase.co/functions/v1/stripe-webhook`

In Stripe dashboard, subscribe to:
- `checkout.session.completed`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## 6) Post-deploy verification

### SQL checks
```sql
select table_name from information_schema.tables
where table_schema='public'
and table_name in ('profiles','subscriptions','onboarding_intakes','allowlist_queue');
```

```sql
select * from subscriptions order by updated_at desc limit 5;
select * from onboarding_intakes order by created_at desc limit 5;
select * from allowlist_queue order by created_at desc limit 5;
```

## Rollback / Mitigation
- If webhook fails: disable webhook endpoint in Stripe temporarily.
- If migration fails: inspect failed statement; do not continue function deploy.
- If queue floods: set all `allowlist_queue.status='blocked'` temporarily and investigate payload source.
