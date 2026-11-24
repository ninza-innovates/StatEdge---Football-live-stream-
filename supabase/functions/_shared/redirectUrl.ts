/**
 * Redirect targets for Stripe Checkout and the Customer Portal.
 * These values come from the request body, so only absolute http(s) URLs
 * are accepted. Other schemes (javascript:, data:) and relative paths are
 * rejected before a Stripe session is created.
 */
export type RedirectUrlResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const REDIRECT_URL_ERROR = "Redirect URL must be an absolute http or https URL";

/** Stripe substitutes this token in success_url. The path form is percent-encoded by URL parsing. */
const STRIPE_SESSION_PLACEHOLDER = "{CHECKOUT_SESSION_ID}";
const ENCODED_SESSION_PLACEHOLDER = "%7BCHECKOUT_SESSION_ID%7D";

/**
 * Accept an absolute http: or https: URL string.
 * Returns the canonical URL, with Stripe's checkout-session placeholder restored
 * when URL parsing encoded it in the path.
 */
export function parseRedirectUrl(value: unknown): RedirectUrlResult {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: REDIRECT_URL_ERROR };
  }

  const trimmed = value.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, error: REDIRECT_URL_ERROR };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: REDIRECT_URL_ERROR };
  }

  if (parsed.hostname === "") {
    return { ok: false, error: REDIRECT_URL_ERROR };
  }

  let url = parsed.href;
  if (trimmed.includes(STRIPE_SESSION_PLACEHOLDER)) {
    url = url.replaceAll(ENCODED_SESSION_PLACEHOLDER, STRIPE_SESSION_PLACEHOLDER);
  }

  return { ok: true, url };
}
