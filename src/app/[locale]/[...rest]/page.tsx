import { notFound } from "next/navigation";

// Any unknown path under a locale (/uk/nope) → the localised [locale]/not-found.tsx,
// rendered inside the locale layout (header, footer, <html lang>).
export default function CatchAll() {
  notFound();
}
