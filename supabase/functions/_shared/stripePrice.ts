/**
 * Public StatEdge subscription prices.
 * Checkout receives `priceId` from the browser, so a session may only be
 * created for these two prices. Any other id (including a $0 or internal
 * price on the same Stripe account) is rejected before Stripe is called.
 * The webhook uses the same map when it stores the subscriber tier.
 */
export const PRICE_TO_TIER = Object.freeze({
  price_1S5umL93V4MxVtg8ofpuszEl: "Weekly",
  price_1S5umg93V4MxVtg8OZ7fGzOi: "Monthly",
} as const);

export type SubscriptionTier = (typeof PRICE_TO_TIER)[keyof typeof PRICE_TO_TIER];

export const ALLOWED_CHECKOUT_PRICE_IDS: readonly string[] = Object.freeze(
  Object.keys(PRICE_TO_TIER),
);

export type PriceIdResult =
  | { ok: true; priceId: string }
  | { ok: false; error: string };

const PRICE_ID_ERROR = "Unknown subscription price";

const allowedPrices = new Set<string>(ALLOWED_CHECKOUT_PRICE_IDS);

/**
 * Accept a price id only when it is one of the public plans.
 * Surrounding whitespace is ignored. The error does not echo the submitted id.
 */
export function parseCheckoutPriceId(value: unknown): PriceIdResult {
  if (typeof value !== "string") {
    return { ok: false, error: PRICE_ID_ERROR };
  }

  const priceId = value.trim();
  if (!allowedPrices.has(priceId)) {
    return { ok: false, error: PRICE_ID_ERROR };
  }

  return { ok: true, priceId };
}

/** Tier stored on the subscriber row, or null when the price is not a public plan. */
export function tierForPrice(priceId: string | null | undefined): SubscriptionTier | null {
  if (!priceId || !allowedPrices.has(priceId)) return null;
  return PRICE_TO_TIER[priceId as keyof typeof PRICE_TO_TIER];
}
