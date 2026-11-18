import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  generateMatchSlug,
  generateMatchTitle,
  slugifyTeamName,
} from "./matchSlug.ts";

describe("slugifyTeamName", () => {
  it("lowercases words and joins them with hyphens", () => {
    assert.equal(slugifyTeamName("Leeds United"), "leeds-united");
  });

  it("removes punctuation and collapses the hyphens that leaves behind", () => {
    assert.equal(
      slugifyTeamName("Brighton & Hove Albion"),
      "brighton-hove-albion",
    );
  });

  it("trims surrounding whitespace before hyphenating", () => {
    assert.equal(slugifyTeamName("  Sheffield United  "), "sheffield-united");
  });
});

describe("generateMatchSlug", () => {
  it("builds the fixture path segment from both club names", () => {
    assert.equal(
      generateMatchSlug("Leeds United", "Sheffield United"),
      "leeds-united-vs-sheffield-united",
    );
  });

  it("uses the same slug rules for each club", () => {
    assert.equal(
      generateMatchSlug("Brighton & Hove Albion", "AFC Bournemouth"),
      "brighton-hove-albion-vs-afc-bournemouth",
    );
  });
});

describe("generateMatchTitle", () => {
  it("keeps the display names around vs", () => {
    assert.equal(
      generateMatchTitle("Leeds United", "Sheffield United"),
      "Leeds United vs Sheffield United",
    );
  });
});
