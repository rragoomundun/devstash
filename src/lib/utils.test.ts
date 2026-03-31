import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "py-1")).toBe("px-2");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
