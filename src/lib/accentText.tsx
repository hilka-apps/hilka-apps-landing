import React from "react";

/**
 * Render a headline where any part wrapped in *asterisks* gets the highlighter
 * mark (`.hl` in globals.css). Lets an editor accent ANY word(s) from a single
 * plain string field.
 *
 *   "Small apps, made with *care*."  →  "care" highlighted
 */
export function renderAccent(
  text: string,
  className = "hl"
): React.ReactNode {
  if (!text) return null;
  // Split on *...*; capture groups land on odd indices.
  const parts = text.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={className}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}
