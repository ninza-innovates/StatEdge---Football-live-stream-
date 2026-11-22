import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contactConfirmationHtml,
  contactNotificationHtml,
  contactNotificationSubject,
  escapeHtml,
  parseContactSubmission,
} from "./format.ts";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Fixture page",
  message: "The match thread did not load.",
};

describe("escapeHtml", () => {
  it("encodes characters that would change the email markup", () => {
    assert.equal(
      escapeHtml(`<img src=x onerror=alert(1)>&"'`),
      "&lt;img src=x onerror=alert(1)&gt;&amp;&quot;&#39;",
    );
  });
});

describe("parseContactSubmission", () => {
  it("trims fields and collapses header line breaks", () => {
    const parsed = parseContactSubmission({
      name: "  Ada\nLovelace  ",
      email: " ada@example.com ",
      subject: "Fixture\r\npage",
      message: "  The match thread did not load.  ",
    });

    assert.deepEqual(parsed, {
      ok: true,
      value: {
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Fixture page",
        message: "The match thread did not load.",
      },
    });
  });

  it("rejects a message that is too short", () => {
    const parsed = parseContactSubmission({ ...valid, message: "too short" });
    assert.deepEqual(parsed, { ok: false, error: "Invalid message" });
  });

  it("rejects an email address with spaces", () => {
    const parsed = parseContactSubmission({
      ...valid,
      email: "ada@example.com\ncc:other@example.com",
    });
    assert.deepEqual(parsed, { ok: false, error: "Invalid email" });
  });

  it("rejects a body that is not the contact form object", () => {
    assert.deepEqual(parseContactSubmission(null), {
      ok: false,
      error: "Invalid contact form submission",
    });
    assert.deepEqual(
      parseContactSubmission({
        name: 1,
        email: valid.email,
        subject: valid.subject,
        message: valid.message,
      }),
      { ok: false, error: "Invalid contact form submission" },
    );
  });
});

describe("contact email html", () => {
  it("keeps a visitor message as text, including its line breaks", () => {
    const html = contactNotificationHtml({
      ...valid,
      name: "Ada <script>",
      message: "Line one\n<img src=x onerror=alert(1)>",
    });

    assert.equal(html.includes("<script>"), false);
    assert.equal(html.includes("<img"), false);
    assert.match(html, /Ada &lt;script&gt;/);
    assert.match(html, /Line one<br>&lt;img src=x onerror=alert\(1\)&gt;/);
  });

  it("escapes the name in the confirmation greeting", () => {
    const html = contactConfirmationHtml({
      name: "Ada <b>",
      message: valid.message,
    });

    assert.match(html, /StatEdge\.ai, Ada &lt;b&gt;!/);
    assert.equal(html.includes("<b>"), false);
  });

  it("builds a single-line subject", () => {
    assert.equal(
      contactNotificationSubject("Help\nBcc: other@example.com"),
      "Contact Form: Help Bcc: other@example.com",
    );
  });
});
