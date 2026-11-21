import { Commissioner, Literata } from "next/font/google";

// Both families cover Ukrainian (ґ є і ї). Keep "cyrillic" in every subsets list —
// src/app/fonts.test.ts enforces it.

/** Headings, large numerals, the About story. Optical size follows font size. */
export const serif = Literata({
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-serif",
  display: "swap",
});

/** Body copy, UI, buttons, forms. */
export const sans = Commissioner({
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  variable: "--font-sans",
  display: "swap",
});
