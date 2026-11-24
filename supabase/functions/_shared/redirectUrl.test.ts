import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseRedirectUrl } from "./redirectUrl.ts";

describe("parseRedirectUrl", () => {
  it("accepts absolute http and https URLs", () => {
    assert.deepEqual(parseRedirectUrl("https://example.com/account?success=true"), {
      ok: true,
      url: "https://example.com/account?success=true",
    });
    assert.deepEqual(parseRedirectUrl("http://localhost:5173/dashboard"), {
      ok: true,
      url: "http://localhost:5173/dashboard",
    });
    assert.deepEqual(parseRedirectUrl("  HTTPS://Example.COM/account  "), {
      ok: true,
      url: "https://example.com/account",
    });
  });

  it("keeps the checkout hash and Stripe session placeholder", () => {
    assert.deepEqual(parseRedirectUrl("https://example.com/#pricing"), {
      ok: true,
      url: "https://example.com/#pricing",
    });
    assert.deepEqual(
      parseRedirectUrl("https://example.com/dashboard?session_id={CHECKOUT_SESSION_ID}"),
      {
        ok: true,
        url: "https://example.com/dashboard?session_id={CHECKOUT_SESSION_ID}",
      },
    );
    assert.deepEqual(parseRedirectUrl("https://example.com/done/{CHECKOUT_SESSION_ID}"), {
      ok: true,
      url: "https://example.com/done/{CHECKOUT_SESSION_ID}",
    });
  });

  it("rejects values that are not non-empty strings", () => {
    for (const value of [undefined, null, 1, true, {}, [], ""]) {
      assert.deepEqual(parseRedirectUrl(value), {
        ok: false,
        error: "Redirect URL must be an absolute http or https URL",
      });
    }
    assert.equal(parseRedirectUrl("   ").ok, false);
    assert.equal(parseRedirectUrl("\n").ok, false);
  });

  it("rejects relative URLs", () => {
    for (const value of ["/dashboard", "dashboard", "//evil.example", "?next=/", "#pricing"]) {
      const parsed = parseRedirectUrl(value);
      assert.equal(parsed.ok, false, value);
    }
  });

  it("rejects schemes other than http and https", () => {
    for (const value of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      " javascript:alert(1)",
      "java\nscript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
      "ftp://example.com/file",
      "blob:https://example.com/uuid",
      "vbscript:msgbox(1)",
    ]) {
      const parsed = parseRedirectUrl(value);
      assert.equal(parsed.ok, false, value);
    }
  });

  it("rejects an http URL with no host", () => {
    assert.equal(parseRedirectUrl("https://").ok, false);
    assert.equal(parseRedirectUrl("http://").ok, false);
  });
});
