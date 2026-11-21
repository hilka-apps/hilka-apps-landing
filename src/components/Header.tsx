"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const NAV = [
  { id: "apps", key: "apps", href: "/#apps" },
  { id: "more", key: "more", href: "/more" },
  { id: "about", key: "about", href: "/about" },
  { id: "contact", key: "contact", href: "/contact" },
] as const;

// Each language is labelled in its own language. "УКР", not "UK" (which reads as
// "United Kingdom"), and no flags: flags are countries, not languages.
const LANG_LABEL: Record<string, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  uk: { short: "УКР", full: "Українська" },
};

function Brand({
  siteName,
  logoUrl,
  onClick,
}: {
  siteName: string;
  logoUrl: string | null;
  onClick?: () => void;
}) {
  const t = useTranslations("header");
  return (
    <Link className="brand" href="/" aria-label={t("home", { site: siteName })} onClick={onClick}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="logo-mark" src={logoUrl} alt="" width={28} height={28} />
      ) : (
        <span className="logo-mark">{siteName.charAt(0)}</span>
      )}
      <span>{siteName}</span>
    </Link>
  );
}

export default function Header({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl: string | null;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // closing the drawer (Esc, ✕, a link, a language) returns focus to the menu button
  useEffect(() => {
    if (wasOpen.current && !drawerOpen) menuButtonRef.current?.focus();
    wasOpen.current = drawerOpen;
  }, [drawerOpen]);

  // lock scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // while the drawer is open: Esc closes it, and Tab is trapped inside it
  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusables = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  const switchLocale = (next: string) => {
    setDrawerOpen(false);
    if (next === locale) return;
    // preserve the current path, query and #hash; swap the locale
    const { search, hash } = window.location;
    router.replace(`${pathname}${search}${hash}`, { locale: next });
  };

  // highlight the nav item for the current page (pathname is locale-stripped)
  const isActive = (href: string) => {
    const base = href.split("#")[0];
    if (base === "/") return pathname.startsWith("/apps"); // "Apps" → app pages
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  return (
    <>
    <header className="site-header">
      <div className="wrap">
        <Brand siteName={siteName} logoUrl={logoUrl} />

        <nav className="nav" aria-label={t("header.navLabel")}>
          {NAV.map((it) => {
            const active = isActive(it.href);
            return (
              <Link
                key={it.id}
                href={it.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {t(`nav.${it.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="header-right">
          <div className="lang-switch" role="group" aria-label={t("header.language")}>
            {routing.locales.map((loc) => (
              <button
                key={loc}
                type="button"
                lang={loc}
                aria-pressed={loc === locale}
                onClick={() => switchLocale(loc)}
              >
                {LANG_LABEL[loc].short}
              </button>
            ))}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="hamburger"
            aria-label={t("header.openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="site-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <span></span>
          </button>
        </div>
      </div>
    </header>

      {/* Mobile drawer — kept OUTSIDE <header> so the fixed overlay and drawer are
          positioned against the viewport even if the sticky header ever gains a
          filter/transform (those make it the containing block for fixed children). */}
      <div
        className={`drawer-overlay${drawerOpen ? " open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        id="site-drawer"
        ref={drawerRef}
        className={`drawer${drawerOpen ? " open" : ""}`}
        aria-hidden={!drawerOpen}
        role="dialog"
        aria-modal="true"
        aria-label={t("header.openMenu")}
      >
        <div className="drawer-top">
          <Brand siteName={siteName} logoUrl={logoUrl} onClick={() => setDrawerOpen(false)} />
          <button
            type="button"
            className="drawer-close"
            aria-label={t("header.closeMenu")}
            onClick={() => setDrawerOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav aria-label={t("header.navLabel")}>
          {NAV.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              aria-current={isActive(it.href) ? "page" : undefined}
              onClick={() => setDrawerOpen(false)}
            >
              {t(`nav.${it.key}`)}
            </Link>
          ))}
        </nav>
        <div className="drawer-foot">
          <div className="drawer-langs" role="group" aria-label={t("header.language")}>
            {routing.locales.map((loc) => (
              <button
                key={loc}
                type="button"
                lang={loc}
                aria-pressed={loc === locale}
                onClick={() => switchLocale(loc)}
              >
                {LANG_LABEL[loc].full}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
