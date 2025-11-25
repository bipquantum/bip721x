#!/bin/bash

# Test Stripe webhook locally by calling the backend canister directly
# Usage: ./test-stripe-webhook.sh <stripe_event_id>

EVENT_ID=$1

if [ -z "$EVENT_ID" ]; then
  echo "❌ Error: Missing event ID"
  echo ""
  echo "Usage: $0 <stripe_event_id>"
  echo "Example: $0 evt_1QRp8wEq6YsoiR2BDTxPizyQ"
  echo ""
  echo "To find event IDs:"
  echo "  1. Go to https://dashboard.stripe.com/test/events"
  echo "  2. Click on a 'checkout.session.completed' event"
  echo "  3. Copy the event ID (starts with 'evt_')"
  exit 1
fi

echo "🧪 Testing Stripe webhook handler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Event ID: $EVENT_ID"
echo ""

# Create webhook payload
WEBHOOK_PAYLOAD=$(cat <<EOF
{
  "id": "$EVENT_ID",
  "type": "checkout.session.completed"
}
EOF
)

echo "📦 Webhook payload:"
echo "$WEBHOOK_PAYLOAD"
echo ""

# Encode as Candid blob
# We need to convert the JSON string to a blob in Candid format
# Candid blob format is: blob "..." where ... is the UTF-8 text

echo "🚀 Calling backend canister..."
echo ""

dfx canister call backend http_request_update "(
  record {
    method = \"POST\";
    url = \"/stripe-webhook\";
    headers = vec {};
    body = blob \"$(echo -n "$WEBHOOK_PAYLOAD" | sed 's/"/\\"/g')\";
  }
)" 2>&1 | tee /tmp/webhook_response.log

EXIT_CODE=${PIPESTATUS[0]}

echo ""
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Webhook test completed"
  echo ""
  echo "💡 Check the canister logs for details:"
  echo "   dfx canister logs backend"
else
  echo "❌ Webhook test failed"
  echo ""
  echo "Check the error above and verify:"
  echo "  1. Backend canister is deployed: dfx canister id backend"
  echo "  2. Stripe API key is set in src/backend/main.mo"
  echo "  3. Event ID exists in Stripe: https://dashboard.stripe.com/test/events/$EVENT_ID"
fi
