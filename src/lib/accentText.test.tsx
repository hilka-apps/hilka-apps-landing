import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderAccent } from "./accentText";

describe("renderAccent", () => {
  it("wraps *starred* words in a serif span", () => {
    const { container } = render(<h1>{renderAccent("Made with *care*.")}</h1>);
    const spans = container.querySelectorAll("span.serif");
    expect(spans).toHaveLength(1);
    expect(spans[0]).toHaveTextContent("care");
    expect(container).toHaveTextContent("Made with care.");
  });
  it("supports several accents and a custom class", () => {
    const { container } = render(<h1>{renderAccent("*One* and *two*", "fp-serif")}</h1>);
    expect(container.querySelectorAll("span.fp-serif")).toHaveLength(2);
  });
  it("returns null for empty text", () => {
    expect(renderAccent("")).toBeNull();
  });
});
