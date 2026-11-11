import { getTranslations } from "next-intl/server";
import type { ContactStrings } from "./ContactForm";

/** Localized strings for <ContactForm>, shared by the Contact and app Support pages. */
export async function getContactStrings(email: string): Promise<ContactStrings> {
  const t = await getTranslations("contact");
  return {
    tabs: {
      suggestion: t("tabs.suggestion"),
      complaint: t("tabs.complaint"),
    },
    form: {
      name: t("form.name"),
      namePlaceholder: t("form.namePlaceholder"),
      email: t("form.email"),
      emailPlaceholder: t("form.emailPlaceholder"),
      subject: t("form.subject"),
      subjectPlaceholder: t("form.subjectPlaceholder"),
      app: t("form.app"),
      appPlaceholder: t("form.appPlaceholder"),
      message: t("form.message"),
      messagePlaceholder: t("form.messagePlaceholder"),
      submit: t("form.submit"),
      required: t("form.required"),
      invalidEmail: t("form.invalidEmail"),
    },
    success: t("success"),
    error: t("error", { email }),
    emailLine: t("emailLine"),
    sendAnother: t("sendAnother"),
  };
}
