// Contact-form validation shared by the client form and the /api/contact route,
// so both sides agree on required fields and email shape. (Length caps are still
// client-only via MESSAGE_MAX — see docs/ROADMAP.md F2.2.)

// Pragmatic email shape check — not RFC-perfect, just enough to reject typos.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MESSAGE_MAX = 500;

export type ContactField = "name" | "email" | "message";
export type ContactErrorCode = "required" | "invalidEmail";
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

// Anything that is not a string (number, boolean, null, object) counts as missing.
const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateContact(data: Record<string, unknown>): ContactErrors {
  const errors: ContactErrors = {};
  if (!text(data.name)) errors.name = "required";

  const email = text(data.email);
  if (!email) errors.email = "required";
  else if (!EMAIL_RE.test(email)) errors.email = "invalidEmail";

  if (!text(data.message)) errors.message = "required";
  return errors;
}
