import { describe, expect, it } from "vitest";
import { deriveHue } from "./hue";

describe("deriveHue", () => {
  it("returns the same hue for the same name", () => {
    expect(deriveHue("Opeth")).toBe(deriveHue("Opeth"));
  });

  it("returns a hue within the 0–359 range", () => {
    const hue = deriveHue("Porcupine Tree");

    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it("returns 0 for an empty name", () => {
    expect(deriveHue("")).toBe(0);
  });

  it("gives different names different hues", () => {
    expect(deriveHue("Tool")).not.toBe(deriveHue("Katatonia"));
  });
});
