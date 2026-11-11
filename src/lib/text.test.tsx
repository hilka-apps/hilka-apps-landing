import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { preserveCase } from "./text";

describe("preserveCase", () => {
  it("protects platform names from uppercase transforms", () => {
    const { container } = render(<span>{preserveCase("Built for iOS and macOS")}</span>);
    const kept = [...container.querySelectorAll(".keep-case")].map((n) => n.textContent);
    expect(kept).toEqual(["iOS", "macOS"]);
    expect(container).toHaveTextContent("Built for iOS and macOS");
  });
  it("matches longer names before shorter ones", () => {
    const { container } = render(<span>{preserveCase("iPadOS")}</span>);
    expect([...container.querySelectorAll(".keep-case")].map((n) => n.textContent)).toEqual(["iPadOS"]);
  });
  it("leaves plain text untouched", () => {
    const { container } = render(<span>{preserveCase("Indie studio")}</span>);
    expect(container.querySelector(".keep-case")).toBeNull();
    expect(container).toHaveTextContent("Indie studio");
  });
});
