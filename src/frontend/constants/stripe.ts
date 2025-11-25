
// Stripe Payment Links - Create these in your Stripe Dashboard
// For each plan, create a Payment Link and paste the URL here
export const STRIPE_PAYMENT_LINKS_TEST: Record<string, string> = {
  "premium_monthly": "https://buy.stripe.com/test_aFa7sLgeUgwgfCs6Wlffy00",
};
export const STRIPE_PAYMENT_LINKS_LIVE: Record<string, string> = {
  "premium_monthly": "https://buy.stripe.com/6oU7sLc8B3kR4XZ01q8ww00",
};

// Your canister ID - used for constructing the return URL
// This will be replaced with the actual canister ID at runtime
export const getCanisterId = (): string => {
  // In production, this would be your deployed canister ID
  // For now, return localhost for development
  if (import.meta.env.DEV) {
    return "localhost:3000";
  }
  // TODO: Replace with your actual canister ID
  return "your-canister-id.ic0.app";
};

// Construct Stripe Checkout URL with metadata
export const getStripeCheckoutUrl = (planId: string, userId: string): string => {
  const baseUrl = (process.env.DFX_NETWORK === "local" ? STRIPE_PAYMENT_LINKS_TEST : STRIPE_PAYMENT_LINKS_LIVE)[planId];

  if (!baseUrl) {
    console.error(`No Stripe payment link configured for plan: ${planId}`);
    return "#";
  }

  // Add client_reference_id and metadata
  const url = new URL(baseUrl);
  url.searchParams.set("client_reference_id", userId);

  // Stripe automatically captures metadata from the payment link
  // But we need to ensure the payment link has metadata.plan_id set in Stripe Dashboard

  return url.toString();
};
