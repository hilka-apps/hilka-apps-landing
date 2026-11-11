import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { siteConfig } from "@/config/site";
import { validateContact } from "@/lib/contact";

type ContactPayload = {
  name: string;
  email: string;
  subject?: string;
  app?: string;
  message: string;
  type: "suggestion" | "complaint";
};

export async function POST(request: Request) {
  const body = (await request.json()) as ContactPayload;

  const errors = Object.values(validateContact(body));
  if (errors.includes("required")) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (errors.includes("invalidEmail")) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  const name = String(body.name).trim();
  const email = String(body.email).trim();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const label = body.type === "complaint" ? "Complaint" : "Suggestion";
  const appTag = body.app ? ` · ${body.app}` : "";
  const subject = body.subject
    ? `[${label}${appTag}] ${body.subject}`
    : `[${label}${appTag}] from ${name}`;

  const { error } = await resend.emails.send({
    from: siteConfig.emailFrom,
    to: siteConfig.notifyEmails,
    replyTo: email,
    subject,
    text:
      `From: ${name} <${email}>\n` +
      `Type: ${label}\n` +
      `App: ${body.app || "General"}\n\n` +
      body.message,
  });

  if (error) {
    console.error("Resend error:", error);
    Sentry.captureException(error, { tags: { route: "contact" } });
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
