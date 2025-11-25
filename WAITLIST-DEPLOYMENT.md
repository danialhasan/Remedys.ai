# Remedys.ai Waitlist Deployment Guide

## Overview

This guide covers deploying the Remedys.ai waitlist integration with the shared Squad Supabase infrastructure. The waitlist uses a `product` column to differentiate between Squad and Remedys signups in the same table.

---

## Architecture

```
Remedys Landing Page (index.html)
    ↓ (Supabase JS SDK)
Shared Waitlist Table (public.waitlist)
    ↓ (PostgreSQL Trigger)
Shared Edge Function (send-waitlist-email)
    ↓ (Conditional Logic)
Resend API → Remedys-branded OR Squad-branded email
```

**Key Feature**: Single infrastructure, dual-product support via `product` column.

---

## Prerequisites

1. **Access to Squad Supabase Project**:
   - Project Ref: `crjtytypinybbhmceubm`
   - URL: `https://crjtytypinybbhmceubm.supabase.co`

2. **Resend Configuration**:
   - API Key already configured in Supabase secrets
   - FROM_EMAIL: `waitlist@trysquad.ai` (works for both products)
   - Domain verified: `trysquad.ai`

3. **Deployment Tools**:
   - Supabase CLI installed
   - Access to Squad GitHub repo
   - Netlify CLI (for Remedys site deployment)

---

## Step 1: Deploy Database Migration

**File**: `squad/supabase/migrations/023_waitlist_add_product_column.sql`

**Option A: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard/project/crjtytypinybbhmceubm/sql/new
2. Copy-paste the migration SQL
3. Click "Run"

**Option B: Via CLI**
```bash
cd ../squad/squad
npx supabase db push --project-ref crjtytypinybbhmceubm
```

**Verification**:
```sql
-- Check column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'waitlist' AND column_name = 'product';

-- Check constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%waitlist%product%';
```

---

## Step 2: Update TypeScript Types (Optional but Recommended)

**File**: `squad/services/backend/src/db/types.ts`

The type definition has been updated to include the `product` field. If you regenerate types from Supabase:

```bash
cd ../squad/squad
npx supabase gen types typescript --project-id crjtytypinybbhmceubm > services/backend/src/db/types.ts
```

---

## Step 3: Deploy Updated Edge Function

**File**: `squad/supabase/functions/send-waitlist-email/index.ts`

The Edge Function now includes:
- `remedysEmailTemplate()` - Branded email for Remedys signups
- `squadEmailTemplate()` - Existing Squad email (renamed)
- Conditional logic based on `product` field

**Deploy**:
```bash
cd ../squad/squad
npx supabase functions deploy send-waitlist-email --project-ref crjtytypinybbhmceubm --no-verify-jwt
```

**Verification**:
Check Edge Function logs:
```bash
npx supabase functions logs send-waitlist-email --project-ref crjtytypinybbhmceubm
```

---

## Step 4: Test Edge Function Locally (Optional)

```bash
cd ../squad/squad

# Set environment variables
export RESEND_API_KEY=re_your_actual_key
export FROM_EMAIL=waitlist@trysquad.ai

# Start Edge Function locally
npx supabase functions serve send-waitlist-email

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-waitlist-email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "INSERT",
    "table": "waitlist",
    "record": {
      "id": "test-id",
      "email": "test@example.com",
      "created_at": "2025-11-21T00:00:00Z",
      "product": "remedys",
      "metadata": {}
    },
    "old_record": null
  }'
```

---

## Step 5: Deploy Remedys.ai Site to Netlify

**File**: `Remedys.ai/index.html` (already updated with Supabase integration)

**Commit Changes**:
```bash
cd /Users/danialhasan/Desktop/dev.nosync/Remedys.ai
git add index.html
git commit -m "feat: integrate waitlist with Supabase + Resend

- Add Supabase client to landing page
- Connect form to shared waitlist table with product='remedys'
- Add PostHog tracking for form events
- Implement loading/success/error states
- Share infrastructure with Squad"
git push origin main
```

**Netlify will automatically deploy** (configured in your repo).

---

## Step 6: Verify End-to-End Flow

### Test Signup Flow

1. **Go to Remedys.ai site** (local or production):
   - Local: http://localhost:3001
   - Production: https://remedys.ai

2. **Submit test email**:
   - Enter a valid email address
   - Click "Get my AI plan"
   - Should see: "✓ Success! Check your email for confirmation."

3. **Check Supabase Table**:
   ```sql
   SELECT id, email, product, created_at, metadata
   FROM public.waitlist
   WHERE product = 'remedys'
   ORDER BY created_at DESC
   LIMIT 5;
   ```

4. **Check Email Delivery**:
   - Check inbox for confirmation email
   - Email should have Remedys.ai branding (orange gradient, Manrope font)
   - Subject: "Welcome to the Remedys.ai Waitlist"
   - Reply-to: hello@remedys.ai

5. **Check Edge Function Logs**:
   ```bash
   npx supabase functions logs send-waitlist-email --project-ref crjtytypinybbhmceubm
   ```
   Should see: `Sending remedys confirmation email to: [email]`

6. **Check PostHog Events** (https://us.posthog.com):
   - `waitlist_form_submitted` with `product: 'remedys'`
   - `waitlist_signup_success` with `product: 'remedys'`

---

## Step 7: Test Duplicate Handling

1. Submit the same email again
2. Should see: "✓ Already on the list!"
3. PostHog should track: `waitlist_duplicate` event

---

## Rollback Plan

If something goes wrong:

1. **Revert Edge Function**:
   ```bash
   cd ../squad/squad
   git checkout HEAD~1 supabase/functions/send-waitlist-email/index.ts
   npx supabase functions deploy send-waitlist-email --project-ref crjtytypinybbhmceubm
   ```

2. **Revert Database Migration**:
   ```sql
   -- Remove product column
   ALTER TABLE public.waitlist DROP COLUMN product;
   DROP INDEX idx_waitlist_product;
   ```

3. **Revert Remedys Site**:
   ```bash
   cd Remedys.ai
   git revert HEAD
   git push origin main
   ```

---

## Production Checklist

Before deploying to production:

- [ ] Database migration applied successfully
- [ ] Edge Function deployed and logs show no errors
- [ ] Test email sent and received with correct branding
- [ ] Duplicate email handling works
- [ ] PostHog events tracking correctly
- [ ] Error handling tested (invalid emails, network issues)
- [ ] Both Squad and Remedys signups work independently
- [ ] Netlify deployment successful

---

## Monitoring

### Key Metrics to Track

1. **Supabase Dashboard** (https://supabase.com/dashboard/project/crjtytypinybbhmceubm):
   - Database table size: `public.waitlist`
   - Edge Function invocations: `send-waitlist-email`
   - Error rate

2. **Resend Dashboard** (https://resend.com):
   - Email delivery rate
   - Bounce rate
   - Open rate (if tracking enabled)

3. **PostHog Dashboard** (https://us.posthog.com):
   - `waitlist_form_submitted` count by product
   - `waitlist_signup_success` vs `waitlist_signup_error` ratio
   - `waitlist_duplicate` count

4. **Netlify Logs**:
   - Deployment success/failure
   - Build errors

### Query for Product Breakdown

```sql
-- Count signups by product
SELECT product, COUNT(*) as signups
FROM public.waitlist
GROUP BY product;

-- Recent signups by product
SELECT product, email, created_at
FROM public.waitlist
ORDER BY created_at DESC
LIMIT 10;

-- Signups per day by product
SELECT
  product,
  DATE(created_at) as signup_date,
  COUNT(*) as signups
FROM public.waitlist
GROUP BY product, DATE(created_at)
ORDER BY signup_date DESC, product;
```

---

## Troubleshooting

### Issue: Email not sent

**Check**:
1. Edge Function logs: `npx supabase functions logs send-waitlist-email`
2. Database trigger fired: Check PostgreSQL logs
3. Resend API status: https://status.resend.com

**Fix**:
- Verify `RESEND_API_KEY` is set in Supabase secrets
- Check FROM_EMAIL is verified in Resend

### Issue: Wrong email template sent

**Check**:
1. Database record has correct `product` value:
   ```sql
   SELECT email, product FROM waitlist WHERE email = 'test@example.com';
   ```
2. Edge Function logs show correct template selection

**Fix**:
- Ensure frontend passes `product: 'remedys'` in INSERT
- Redeploy Edge Function if logic is incorrect

### Issue: Duplicate constraint error

**Expected**: This is handled gracefully in the frontend.

**Verify**:
- User sees: "✓ Already on the list!"
- No error logged in console

### Issue: PostHog events not tracking

**Check**:
1. PostHog script loaded: Check browser console
2. API key correct: `phc_CEGE11ffVSoStkKyi3vngbXaQUo2Bpw1BEzGZ5AnTOf`

**Fix**:
- Verify `window.posthog` is defined before calling
- Check network tab for PostHog API calls

---

## Future Enhancements

1. **Separate FROM_EMAIL**:
   - Configure `FROM_EMAIL_REMEDYS=waitlist@remedys.ai`
   - Verify `remedys.ai` domain in Resend
   - Update Edge Function to use product-specific FROM_EMAIL

2. **Email Sequences**:
   - Send follow-up emails to Remedys waitlist
   - Announce Q1 2026 launch
   - Share case studies and updates

3. **Admin Dashboard**:
   - Build view to see all waitlist signups
   - Filter by product, date range
   - Export to CSV for sales outreach

4. **A/B Testing**:
   - Test different email templates
   - Track open rates and click-through rates
   - Optimize conversion

---

## Support

**Questions or Issues?**
- Slack: #squad-dev
- Email: hello@trysquad.ai
- Docs: This file + `/squad/WAITLIST-EMAIL-SETUP.md`

---

**Deployment completed by**: Claude Code
**Date**: 2025-11-21
**Files modified**:
- `squad/supabase/migrations/023_waitlist_add_product_column.sql` (new)
- `squad/services/backend/src/db/types.ts` (updated)
- `squad/supabase/functions/send-waitlist-email/index.ts` (updated)
- `Remedys.ai/index.html` (updated)
- `Remedys.ai/WAITLIST-DEPLOYMENT.md` (new, this file)
