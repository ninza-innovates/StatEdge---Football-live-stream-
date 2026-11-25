import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALLOWED_CHECKOUT_PRICE_IDS,
  parseCheckoutPriceId,
  tierForPrice,
} from "./stripePrice.ts";

const WEEKLY = "price_1S5umL93V4MxVtg8ofpuszEl";
const MONTHLY = "price_1S5umg93V4MxVtg8OZ7fGzOi";

describe("parseCheckoutPriceId", () => {
  it("accepts the weekly and monthly prices the pricing page sends", () => {
    assert.deepEqual(ALLOWED_CHECKOUT_PRICE_IDS, [WEEKLY, MONTHLY]);
    assert.deepEqual(parseCheckoutPriceId(WEEKLY), { ok: true, priceId: WEEKLY });
    assert.deepEqual(parseCheckoutPriceId(`  ${MONTHLY}\n`), { ok: true, priceId: MONTHLY });
  });

  it("rejects values that are not one of those prices", () => {
    for (const value of [
      undefined,
      null,
      0,
      true,
      {},
      [],
      "",
      "   ",
      "price_free",
      "price_1S5umL93V4MxVtg8ofpuszElx",
      "PRICE_1S5umL93V4MxVtg8ofpuszEl",
      `${WEEKLY} ${MONTHLY}`,
      `price_${"0".repeat(8)}`,
    ]) {
      assert.deepEqual(
        parseCheckoutPriceId(value),
        { ok: false, error: "Unknown subscription price" },
        String(value),
      );
    }
  });
});

describe("tierForPrice", () => {
  it("maps the public prices to the tiers stored by the webhook", () => {
    assert.equal(tierForPrice(WEEKLY), "Weekly");
    assert.equal(tierForPrice(MONTHLY), "Monthly");
  });

  it("returns null for a missing or unknown price", () => {
    assert.equal(tierForPrice(undefined), null);
    assert.equal(tierForPrice(null), null);
    assert.equal(tierForPrice(""), null);
    assert.equal(tierForPrice("price_other"), null);
  });
});
