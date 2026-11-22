/**
 * Contact-form fields after they have been trimmed and checked.
 * Name, email, and subject are single-line so they can be used in headers.
 */
export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactParseResult =
  | { ok: true; value: ContactMessage }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape text before it is placed in an HTML email body. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** Remove line breaks so a value cannot split an email header. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Escape a message and keep its line breaks as HTML. */
export function messageToHtml(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

/**
 * Accept the JSON body the support form sends.
 * Limits match the client schema in `src/pages/Support.tsx`.
 */
export function parseContactSubmission(body: unknown): ContactParseResult {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Invalid contact form submission" };
  }

  const record = body as Record<string, unknown>;
  const name = record.name;
  const email = record.email;
  const subject = record.subject;
  const message = record.message;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof subject !== "string" ||
    typeof message !== "string"
  ) {
    return { ok: false, error: "Invalid contact form submission" };
  }

  const value: ContactMessage = {
    name: singleLine(name),
    email: singleLine(email),
    subject: singleLine(subject),
    message: message.trim(),
  };

  if (value.name.length < 1 || value.name.length > 100) {
    return { ok: false, error: "Invalid name" };
  }
  if (value.email.length > 255 || !EMAIL_PATTERN.test(value.email)) {
    return { ok: false, error: "Invalid email" };
  }
  if (value.subject.length < 1 || value.subject.length > 200) {
    return { ok: false, error: "Invalid subject" };
  }
  if (value.message.length < 10 || value.message.length > 2000) {
    return { ok: false, error: "Invalid message" };
  }

  return { ok: true, value };
}

/** Subject line for the message sent to the support inbox. */
export function contactNotificationSubject(subject: string): string {
  return `Contact Form: ${singleLine(subject)}`;
}

/** HTML body for the message sent to the support inbox. */
export function contactNotificationHtml(message: ContactMessage): string {
  return `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${escapeHtml(message.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(message.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(message.subject)}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${messageToHtml(message.message)}</p>
      `;
}

/** HTML body for the confirmation sent back to the visitor. */
export function contactConfirmationHtml(message: Pick<ContactMessage, "name" | "message">): string {
  return `
        <h1>Thank you for contacting StatEdge.ai, ${escapeHtml(message.name)}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${messageToHtml(message.message)}</p>
        <hr />
        <p>Best regards,<br>The StatEdge Team</p>
      `;
}
