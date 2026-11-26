import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldShowExitIntent } from "./exitIntent.ts";

describe("shouldShowExitIntent", () => {
  it("stays closed while the page is scrolling down", () => {
    assert.equal(shouldShowExitIntent(160, 100), false);
  });

  it("stays closed for an upward move of 50px or less", () => {
    assert.equal(shouldShowExitIntent(110, 160), false);
    assert.equal(shouldShowExitIntent(111, 160), false);
  });

  it("opens when the visitor jumps upward near the top of the page", () => {
    assert.equal(shouldShowExitIntent(120, 180), true);
    assert.equal(shouldShowExitIntent(199, 250), true);
  });

  it("stays closed once the visitor is 200px or further down", () => {
    assert.equal(shouldShowExitIntent(200, 260), false);
    assert.equal(shouldShowExitIntent(400, 500), false);
  });
});
