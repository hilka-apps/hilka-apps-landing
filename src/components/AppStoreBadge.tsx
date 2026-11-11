import { useTranslations } from "next-intl";

const AppleGlyph = () => (
  <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
    <path d="M16.36 12.78c-.02-2.06 1.68-3.05 1.76-3.1-0.96-1.4-2.45-1.6-2.98-1.62-1.27-.13-2.48.75-3.12.75-.64 0-1.64-.73-2.7-.71-1.39.02-2.67.81-3.38 2.05-1.44 2.5-.37 6.2 1.04 8.23.69.99 1.51 2.1 2.58 2.06 1.04-.04 1.43-.67 2.69-.67 1.25 0 1.61.67 2.7.65 1.12-.02 1.82-1 2.5-2 .79-1.15 1.11-2.26 1.13-2.32-.02-.01-2.17-.83-2.19-3.3zM14.3 6.6c.57-.69.95-1.65.85-2.6-.82.03-1.81.55-2.4 1.23-.53.61-.99 1.58-.86 2.51.91.07 1.84-.46 2.41-1.14z" />
  </svg>
);

/**
 * App Store badge, three states:
 * - `href`  → Apple's badge as a link to the store;
 * - `inert` → Apple's badge as a plain span (inside another link, e.g. the app card);
 * - neither → a "coming soon" pill. Apple's badge is never shown for an app that
 *   is not in the store yet.
 */
export default function AppStoreBadge({ href, inert }: { href?: string; inert?: boolean }) {
  const t = useTranslations("appstore");
  if (!href && !inert) {
    return <span className="appstore-soon">{t("soon")}</span>;
  }
  const inner = (
    <>
      <AppleGlyph />
      <span className="as-txt">
        <span className="as-small">{t("small")}</span>
        <span className="as-big">{t("big")}</span>
      </span>
    </>
  );

  if (href) {
    return (
      <a className="appstore" href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <span className="appstore" role="img" aria-label={`${t("small")} ${t("big")}`}>
      {inner}
    </span>
  );
}
