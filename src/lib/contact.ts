// Contact-form validation shared by the client form and the /api/contact route,
// so both sides always agree on what counts as a valid submission.

// Pragmatic email shape check — not RFC-perfect, just enough to reject typos.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MESSAGE_MAX = 500;

export type ContactField = "name" | "email" | "message";
export type ContactErrorCode = "required" | "invalidEmail";
export type ContactErrors = Partial<Record<ContactField, ContactErrorCode>>;

const text = (v: unknown) => String(v ?? "").trim();

export function validateContact(data: Record<string, unknown>): ContactErrors {
  const errors: ContactErrors = {};
  if (!text(data.name)) errors.name = "required";

  const email = text(data.email);
  if (!email) errors.email = "required";
  else if (!EMAIL_RE.test(email)) errors.email = "invalidEmail";

  if (!text(data.message)) errors.message = "required";
  return errors;
}
