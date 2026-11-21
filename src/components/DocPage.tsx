import "./DocPage.css";

type Section = { heading: string; body: string[] };

function parseMarkdown(md: string): Section[] {
  const lines = md.split("\n");
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const line of lines) {
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      if (current) sections.push(current);
      current = { heading: h2[1], body: [] };
      continue;
    }
    if (current && line.trim()) {
      current.body.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderLine(text: string) {
  const parts = text.split(/(\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (match) return <a key={i} href={match[2]} className="textlink">{match[1]}</a>;
    return part;
  });
}

export default function DocPage({
  h1,
  updated,
  markdown,
}: {
  h1: string;
  updated: string;
  markdown: string;
}) {
  const intro = markdown.split(/^## /m)[0].trim();
  const sections = parseMarkdown(markdown);

  return (
    <div className="doc-layout">
      <header className="doc-header page-hero">
        <div className="wrap doc-wrap">
          <h1 className="h1 page-h1">{h1}</h1>
          <p className="doc-updated">{updated}</p>
        </div>
      </header>

      <section className="section white">
        <div className="wrap doc-wrap">
          {intro && <p className="doc-intro">{intro}</p>}
          {sections.map((sec, i) => (
            <div key={i} className="doc-section">
              <h2 className="doc-h2">{sec.heading}</h2>
              {sec.body.map((line, j) => (
                <p key={j}>{renderLine(line)}</p>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
