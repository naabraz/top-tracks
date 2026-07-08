import { describe, expect, it } from "vitest";
import { formatCount } from "./format";

describe("formatCount", () => {
  it("returns the raw number below one thousand", () => {
    expect(formatCount(742)).toBe("742");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatCount(12_300)).toBe("12.3K");
  });

  it("drops a trailing .0", () => {
    expect(formatCount(2_000)).toBe("2K");
  });

  it("formats millions with an M suffix", () => {
    expect(formatCount(1_200_000)).toBe("1.2M");
  });

  it("formats zero", () => {
    expect(formatCount(0)).toBe("0");
  });
});
