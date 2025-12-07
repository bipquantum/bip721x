# Stripe Integration Setup Guide

This guide will help you set up Stripe payment integration for subscription plans.

## Architecture Overview

```
┌─────────────┐                    ┌──────────────┐
│  Frontend   │───────────────────▶│    Stripe    │
│  (React)    │  Redirect to        │   Checkout   │
│             │  Payment Link       │              │
└─────────────┘                    └──────┬───────┘
                                           │
                                           │ Webhook POST
                                           ▼
                                    ┌──────────────┐
                                    │ ICP Backend  │
                                    │ Canister     │
                                    │              │
                                    │ Verifies via │
                                    │ Stripe API   │
                                    └──────────────┘
```

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_...` for test mode or `sk_live_...` for live mode)
4. Add the keys to your `~/.bashrc` file:
   ```bash
   export STRIPE_TEST_SECRET_KEY="sk_test_YOUR_TEST_KEY_HERE"
   export STRIPE_LIVE_SECRET_KEY="sk_live_YOUR_LIVE_KEY_HERE"
   ```
5. Reload your shell:
   ```bash
   source ~/.bashrc
   ```

**Note**: The backend canister reads these environment variables to authenticate with Stripe's API.

## Step 2: Create Stripe Payment Links

For each subscription plan in your backend, create a Stripe Payment Link:

1. Go to **Payments** → **Payment links** in Stripe Dashboard
2. Click **+ New** to create a payment link
3. Configure the payment link:
   - **Product**: Create a product for your plan (e.g., "Pro Monthly")
   - **Price**: Set the price matching `renewalPriceUsdtE6s` (convert from e6s to USD)
   - **Payment method types**: Enable Card
   - **After payment**: ⚠️ **IMPORTANT** Select **"Redirect to a URL"** and enter:
     - For local dev: `http://localhost:3000/profile?tab=subscription&payment=success`
     - For production: `https://dapp.bipquantum.com/profile?tab=subscription&payment=success`
4. Copy the Payment Link URL (e.g., `https://buy.stripe.com/test_xxxxx`)
5. Repeat for each plan

**Note**: The redirect URL ensures users return to your app after payment instead of staying on Stripe's confirmation page.

## Step 3: Configure Backend

The backend automatically reads Stripe secret keys from environment variables:
- `STRIPE_TEST_SECRET_KEY` for test mode
- `STRIPE_LIVE_SECRET_KEY` for production

Ensure these are set in your `~/.bashrc` as described in Step 1 before deploying.

## Step 4: Configure Frontend

Update `src/frontend/constants/stripe.ts`:

```typescript
export const STRIPE_PAYMENT_LINKS: Record<string, string> = {
  "free": "", // No payment link needed for free plan
  "pro_monthly": "https://buy.stripe.com/test_xxxxx",
  "enterprise_yearly": "https://buy.stripe.com/test_yyyyy",
  // Add all your plan IDs with their corresponding payment links
};
```

The plan IDs must match exactly what's defined in your backend plans.

## Step 5: Set Up Webhook Endpoint

1. Deploy your backend canister:
   ```bash
   dfx deploy backend
   ```

2. Get your canister's webhook URL:
   ```
   https://<canister-id>.ic0.app/stripe-webhook
   ```

   For local development:
   ```
   http://<canister-id>.localhost:8000/stripe-webhook
   ```

3. In Stripe Dashboard, go to **Developers** → **Webhooks**
4. Click **+ Add endpoint**
5. Enter your webhook URL
6. Select events to listen to:
   - ✅ `checkout.session.completed`
7. Copy the **Signing secret** (starts with `whsec_...`)

**Note**: Currently, webhook signature verification is not implemented (since IC doesn't expose custom headers). Instead, we verify authenticity by fetching the event from Stripe's API.

## Step 6: Test the Integration

### Testing Locally

1. Start your local replica:
   ```bash
   dfx start --clean
   ```

2. Deploy canisters:
   ```bash
   dfx deploy
   ```

3. For webhook testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to http://<canister-id>.localhost:8000/stripe-webhook
   ```

4. Trigger a test event:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Testing in Production

1. Deploy to IC mainnet:
   ```bash
   dfx deploy --network ic
   ```

2. Set up webhook in Stripe Dashboard pointing to production URL

3. Use Stripe test mode payment links with test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## How It Works

### Payment Flow

1. **User selects plan**: User chooses a plan on `/plans` page
2. **Choose payment method**: Modal shows ckUSDT vs Stripe options
3. **Stripe redirect**: If Stripe selected, user redirected to Stripe Checkout
4. **User completes payment**: On Stripe's hosted checkout page
5. **User redirected back**: Returns to `/profile?tab=subscription&payment=success`
6. **Payment verification UI**: Frontend shows "Verifying your payment..." banner and polls backend
7. **Webhook received**: Stripe sends webhook to your canister (typically within 5-10 seconds)
8. **Event verification**: Canister calls Stripe API to verify event is legitimate
9. **Subscription activation**: Canister calls `setStripeSubscription()`
10. **UI updates**: Frontend detects subscription change and shows success state

### Security

- **No signature verification needed**: We verify events by fetching from Stripe API
- **HTTPS outcalls**: Uses IC's consensus-verified HTTPS outcalls via idempotent proxy
- **Event deduplication**: Stripe events have unique IDs
- **User identification**: Uses `client_reference_id` (user's Principal) in checkout URL

## Webhook Event Structure

Example `checkout.session.completed` event:

```json
{
  "id": "evt_xxxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_xxxxx",
      "client_reference_id": "2vxsx-fae", // User's Principal
      "amount_total": 999,
      "payment_status": "paid"
    }
  }
}
```

## Important Notes

### Plan ID Mapping

Ensure your plan IDs match across two places:
1. Backend plan registration (when creating plans)
2. Frontend constants file (`STRIPE_PAYMENT_LINKS`)

### Testing Webhooks Locally

Since Stripe cannot reach `localhost`, you need to:
- Use [Stripe CLI](https://stripe.com/docs/stripe-cli) with `stripe listen`
- Or use [ngrok](https://ngrok.com/) to tunnel to your local canister
- Or test directly on deployed canisters (recommended)

### Cycles Cost

Each webhook verification makes an HTTPS outcall to Stripe API:
- Estimated cost: ~1 billion cycles per webhook
- Budget accordingly in your canister

## Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct in Stripe Dashboard
2. Verify canister is deployed and accessible
3. Check Stripe Dashboard → Webhooks → Recent deliveries for errors

### Event verification failing

1. Verify environment variables `STRIPE_TEST_SECRET_KEY` or `STRIPE_LIVE_SECRET_KEY` are set correctly in `~/.bashrc`
2. Check canister logs: `dfx canister logs backend`

### Subscription not activating

1. Check webhook received `checkout.session.completed` event
2. Check `client_reference_id` is a valid Principal
3. Review canister logs for errors

### Payment link not working

1. Ensure payment link is in test mode if using test keys
2. Check the payment link is active (not archived)

## Next Steps

1. **Production keys**: Set `STRIPE_LIVE_SECRET_KEY` in environment for production deployments
2. **Error handling**: Add better error messages to user
3. **Subscription renewals**: Implement recurring payment handling
4. **Refunds**: Add webhook handler for `charge.refunded` events

## Useful Resources

- [Stripe Payment Links](https://stripe.com/docs/payment-links)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe API Events](https://stripe.com/docs/api/events)
- [IC HTTPS Outcalls](https://internetcomputer.org/docs/current/developer-docs/integrations/https-outcalls/)
