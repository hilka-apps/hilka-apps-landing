"use client";
import { useEffect, useRef, useState } from "react";
import {
  MESSAGE_MAX,
  validateContact,
  type ContactErrorCode,
  type ContactField,
} from "@/lib/contact";
import "./ContactForm.css";

export type ContactStrings = {
  tabs: { label: string; suggestion: string; complaint: string };
  form: {
    name: string; namePlaceholder: string;
    email: string; emailPlaceholder: string;
    subject: string; subjectPlaceholder: string;
    app: string; appPlaceholder: string;
    message: string; messagePlaceholder: string;
    submit: string;
    sending: string;
    required: string;
    invalidEmail: string;
  };
  success: string;
  error: string;
  emailLine: string;
  sendAnother: string;
};

type FieldErrors = { name?: string; email?: string; message?: string };
export type ContactIntent = "suggestion" | "complaint";

const INTENTS: ContactIntent[] = ["suggestion", "complaint"];
// Focus order for the first invalid field after a failed submit.
const FIELD_ORDER: (keyof FieldErrors)[] = ["name", "email", "message"];
const errorId = (field: keyof FieldErrors) => `cf-${field}-error`;

export default function ContactForm({
  strings,
  email,
  appOptions,
  defaultApp,
  defaultIntent = "suggestion",
}: {
  strings: ContactStrings;
  email: string;
  appOptions: string[];
  /** Preselect this app (support page); ignored if it is not one of `appOptions`. */
  defaultApp?: string;
  /** Preselected intent: an idea on /contact, a problem on an app's support page. */
  defaultIntent?: ContactIntent;
}) {
  const [tab, setTab] = useState<ContactIntent>(defaultIntent);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  // where focus goes after the form is swapped for the success message, or back
  const focusAfterRender = useRef<"success" | "form" | null>(null);

  useEffect(() => {
    if (focusAfterRender.current === "success") successRef.current?.focus();
    if (focusAfterRender.current === "form") formRef.current?.querySelector<HTMLElement>("#cf-name")?.focus();
    focusAfterRender.current = null;
  }, [status]);

  // Map shared validation codes to this locale's messages.
  function validate(data: Record<string, FormDataEntryValue>): FieldErrors {
    const next: FieldErrors = {};
    const codes = Object.entries(validateContact(data)) as [ContactField, ContactErrorCode][];
    for (const [field, code] of codes) {
      next[field] = strings.form[code];
    }
    return next;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function resetForm() {
    focusAfterRender.current = "form";
    setTab(defaultIntent);
    setStatus("idle");
    setCharCount(0);
    setErrors({});
  }

  // aria-invalid + aria-describedby for a field's error message
  const errorProps = (field: keyof FieldErrors) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": errorId(field) } : {};
  const errorText = (field: keyof FieldErrors) =>
    errors[field] ? (
      <span className="cf-error" id={errorId(field)}>
        {errors[field]}
      </span>
    ) : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypotRef.current?.value) return; // bot trap

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const fieldErrors = validate(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const first = FIELD_ORDER.find((f) => fieldErrors[f]);
      if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: tab }),
      });
      if (res.ok) focusAfterRender.current = "success";
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="cf-wrap">
      {/* Intent: a native radio group (arrow keys, one tab stop), styled as a
          segmented control. */}
      <div className="cf-tabs" role="radiogroup" aria-label={strings.tabs.label}>
        {INTENTS.map((t) => (
          <label key={t} className={`cf-tab${tab === t ? " sel" : ""}`}>
            <input
              type="radio"
              name="cf-intent"
              value={t}
              checked={tab === t}
              onChange={() => setTab(t)}
            />
            {strings.tabs[t]}
          </label>
        ))}
      </div>

      {status === "success" ? (
        <div className="cf-success">
          <div className="cf-status success" role="status" tabIndex={-1} ref={successRef}>
            <span aria-hidden="true">✓</span> {strings.success}
          </div>
          <button type="button" className="textlink cf-again" onClick={resetForm}>
            {strings.sendAnother}
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          className="cf-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={status === "sending" || undefined}
        >
          {/* Honeypot */}
          <input
            ref={honeypotRef}
            name="_gotcha"
            type="text"
            tabIndex={-1}
            aria-hidden="true"
            style={{ display: "none" }}
          />

          <div className="cf-field">
            <label htmlFor="cf-name">
              {strings.form.name} <span className="cf-req" aria-hidden="true">*</span>
            </label>
            <input
              id="cf-name"
              name="name"
              type="text"
              placeholder={strings.form.namePlaceholder}
              required
              autoComplete="name"
              {...errorProps("name")}
              onChange={() => clearError("name")}
            />
            {errorText("name")}
          </div>

          <div className="cf-field">
            <label htmlFor="cf-email">
              {strings.form.email} <span className="cf-req" aria-hidden="true">*</span>
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              placeholder={strings.form.emailPlaceholder}
              required
              autoComplete="email"
              {...errorProps("email")}
              onChange={() => clearError("email")}
            />
            {errorText("email")}
          </div>

          <div className="cf-field">
            <label htmlFor="cf-app">{strings.form.app}</label>
            <select
              id="cf-app"
              name="app"
              defaultValue={defaultApp && appOptions.includes(defaultApp) ? defaultApp : ""}
            >
              <option value="">{strings.form.appPlaceholder}</option>
              {appOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="cf-field">
            <label htmlFor="cf-subject">{strings.form.subject}</label>
            <input
              id="cf-subject"
              name="subject"
              type="text"
              placeholder={strings.form.subjectPlaceholder}
            />
          </div>

          <div className="cf-field">
            <div className="cf-label-row">
              <label htmlFor="cf-message">
                {strings.form.message} <span className="cf-req" aria-hidden="true">*</span>
              </label>
              <span className={`cf-counter${charCount > MESSAGE_MAX ? " over" : ""}`}>
                {charCount}/{MESSAGE_MAX}
              </span>
            </div>
            <textarea
              id="cf-message"
              name="message"
              rows={5}
              placeholder={strings.form.messagePlaceholder}
              required
              maxLength={MESSAGE_MAX}
              {...errorProps("message")}
              onChange={(e) => {
                setCharCount(e.target.value.length);
                clearError("message");
              }}
            />
            {errorText("message")}
          </div>

          {status === "error" && (
            <div className="cf-status error" role="alert">
              {strings.error}
            </div>
          )}

          <div className="cf-foot">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={status === "sending"}
            >
              {status === "sending" ? strings.form.sending : strings.form.submit}
            </button>
            <p className="cf-email-line">
              {strings.emailLine}{" "}
              <a href={`mailto:${email}`} className="textlink">
                {email}
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
