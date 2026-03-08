# Stripe Webhook Test Pack

## Test Matrix

## A) checkout.session.completed
Input expectations:
- metadata includes `user_id` and `phone`

Expected effects:
1. `subscriptions` upsert:
   - `user_id` = metadata.user_id
   - `plan` = `pro`
   - `status` = `active`
   - `stripe_checkout_session_id` populated
2. `allowlist_queue` insert:
   - `user_id` = metadata.user_id
   - `phone` = metadata.phone
   - `status` = `pending`
   - `source` = `stripe_webhook`

## B) customer.subscription.deleted
Expected effects:
- Matching subscription row marked `status='inactive'`

## C) invoice.payment_failed
Expected effects:
- Matching subscription row marked `status='inactive'`

---

## Suggested Local Trigger Commands
(Use only after webhook secret + endpoint are configured)

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

## SQL assertions
```sql
select user_id, plan, status, stripe_checkout_session_id, updated_at
from subscriptions
order by updated_at desc
limit 10;
```

```sql
select user_id, phone, status, source, reason, created_at
from allowlist_queue
order by created_at desc
limit 10;
```

## Failure handling checklist
- Verify Stripe endpoint points to correct Supabase project.
- Verify `STRIPE_WEBHOOK_SECRET` in Supabase secrets matches Stripe endpoint secret.
- Confirm event includes metadata keys expected by function.
- Check function logs in Supabase dashboard.
