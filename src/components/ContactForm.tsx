"use client";
import { useState, useRef } from "react";
import {
  MESSAGE_MAX,
  validateContact,
  type ContactErrorCode,
  type ContactField,
} from "@/lib/contact";
import "./ContactForm.css";

type Strings = {
  tabs: { suggestion: string; complaint: string };
  form: {
    name: string; namePlaceholder: string;
    email: string; emailPlaceholder: string;
    subject: string; subjectPlaceholder: string;
    app: string; appPlaceholder: string;
    message: string; messagePlaceholder: string;
    submit: string;
    required: string;
    invalidEmail: string;
  };
  success: string;
  error: string;
  emailLine: string;
  sendAnother: string;
};

type FieldErrors = { name?: string; email?: string; message?: string };

export default function ContactForm({
  strings,
  email,
  appOptions,
}: {
  strings: Strings;
  email: string;
  appOptions: string[];
}) {
  const [tab, setTab] = useState<"suggestion" | "complaint">("suggestion");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const honeypotRef = useRef<HTMLInputElement>(null);

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
    setStatus("idle");
    setCharCount(0);
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypotRef.current?.value) return; // bot trap

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const fieldErrors = validate(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
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
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="cf-wrap">
      {/* Intent tabs */}
      <div className="cf-tabs" role="tablist">
        {(["suggestion", "complaint"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`cf-tab${tab === t ? " sel" : ""}`}
            onClick={() => setTab(t)}
            type="button"
          >
            {strings.tabs[t]}
          </button>
        ))}
      </div>

      {status === "success" ? (
        <div className="cf-success">
          <div className="cf-status success">
            <span>✓</span> {strings.success}
          </div>
          <button type="button" className="textlink cf-again" onClick={resetForm}>
            {strings.sendAnother}
          </button>
        </div>
      ) : (
        <form className="cf-form" onSubmit={handleSubmit} noValidate>
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
              aria-invalid={errors.name ? true : undefined}
              onChange={() => clearError("name")}
            />
            {errors.name && <span className="cf-error">{errors.name}</span>}
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
              aria-invalid={errors.email ? true : undefined}
              onChange={() => clearError("email")}
            />
            {errors.email && <span className="cf-error">{errors.email}</span>}
          </div>

          <div className="cf-field">
            <label htmlFor="cf-app">{strings.form.app}</label>
            <select id="cf-app" name="app" defaultValue="">
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
              aria-invalid={errors.message ? true : undefined}
              onChange={(e) => {
                setCharCount(e.target.value.length);
                clearError("message");
              }}
            />
            {errors.message && <span className="cf-error">{errors.message}</span>}
          </div>

          {status === "error" && (
            <div className="cf-status error">{strings.error}</div>
          )}

          <div className="cf-foot">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={status === "sending"}
            >
              {status === "sending" ? "…" : strings.form.submit}
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
