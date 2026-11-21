import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DocPage from "./DocPage";

const md = "Intro line.\n\n## Data\nWe store nothing.";

describe("DocPage", () => {
  it("marks a fallback body with its language and shows the note above it", () => {
    const { container } = render(
      <DocPage h1="Політика" updated="" markdown={md} bodyLang="en" note="Цей документ поки доступний лише англійською." />
    );
    const note = screen.getByText("Цей документ поки доступний лише англійською.");
    const body = container.querySelector('[lang="en"]');
    expect(body).toHaveTextContent("We store nothing.");
    expect(body).not.toContainElement(note);
    expect(note.compareDocumentPosition(body!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("adds no note or lang override when the body is in the page language", () => {
    const { container } = render(<DocPage h1="Privacy" updated="" markdown={md} />);
    expect(container.querySelector("[lang]")).toBeNull();
    expect(container.querySelector(".doc-lang-note")).toBeNull();
  });
});
