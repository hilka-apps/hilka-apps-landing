"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick, type Lang } from "@/lib/i18n";
import type { SanityLegalLink } from "@/sanity/lib/queries";
import "./AppTabs.css";

// Tab row under the site header on every per-app page: Overview, the app's own
// filled-in legal docs, Support. Each tab is its own page; these URLs are entered in
// App Store Connect, so they must stay /apps/<slug>, /apps/<slug>/<doc>, /apps/<slug>/support.
export default function AppTabs({
  appName,
  slug,
  docs,
  current,
  lang,
}: {
  appName: string;
  slug: string;
  docs: SanityLegalLink[];
  /** "overview", "support" or the current doc's slug */
  current: string;
  lang: Lang;
}) {
  const t = useTranslations("appPage");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const base = `/apps/${slug}`;
  const tabs = [
    { id: "overview", href: base, label: t("overview") },
    ...docs.map((d) => ({ id: d.slug, href: `${base}/${d.slug}`, label: pick(d.title, lang) })),
    { id: "support", href: `${base}/support`, label: t("support") },
  ];

  // On narrow screens the row scrolls sideways; bring the current tab into view.
  // Only the row's own scrollLeft changes, never the page scroll.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!scroller || !active || scroller.scrollWidth <= scroller.clientWidth) return;
    const overflowRight = active.offsetLeft + active.offsetWidth - (scroller.scrollLeft + scroller.clientWidth);
    if (overflowRight > 0) scroller.scrollLeft += overflowRight + 20;
  }, [current]);

  return (
    <nav className="app-tabs" aria-label={t("linksLabel")}>
      <div className="wrap app-tabs-row" ref={scrollerRef}>
        <span className="app-tabs-name">{appName}:</span>
        <ul className="app-tabs-list">
          {tabs.map((tab) => {
            const isCurrent = tab.id === current;
            return (
              <li key={tab.id}>
                <Link href={tab.href} aria-current={isCurrent ? "page" : undefined}>
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
