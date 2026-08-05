import { describe, expect, it } from "vitest";
import { formatCount, formatNumber } from "./format";

// Intl renders a non-breaking space before pt-BR compact suffixes.
const NBSP = " ";

describe("formatNumber", () => {
  it("groups with commas for en", () => {
    expect(formatNumber(1_213_400, "en")).toBe("1,213,400");
  });

  it("groups with dots for pt-BR", () => {
    expect(formatNumber(1_213_400, "pt-BR")).toBe("1.213.400");
  });

  it("defaults to the English grouping when no locale is given", () => {
    expect(formatNumber(1_213_400)).toBe("1,213,400");
  });

  it("leaves small numbers unchanged", () => {
    expect(formatNumber(742, "en")).toBe("742");
  });
});

describe("formatCount", () => {
  it("keeps values under one thousand unformatted in both locales", () => {
    expect(formatCount(742, "en")).toBe("742");
    expect(formatCount(742, "pt-BR")).toBe("742");
  });

  it("formats thousands with a K suffix for en", () => {
    expect(formatCount(12_300, "en")).toBe("12.3K");
  });

  it("formats millions with an M suffix for en", () => {
    expect(formatCount(1_200_000, "en")).toBe("1.2M");
  });

  it("formats thousands with a mil suffix for pt-BR", () => {
    expect(formatCount(12_300, "pt-BR")).toBe(`12,3${NBSP}mil`);
  });

  it("formats millions with a mi suffix for pt-BR", () => {
    expect(formatCount(1_200_000, "pt-BR")).toBe(`1,2${NBSP}mi`);
  });

  it("drops the trailing zero", () => {
    expect(formatCount(1_000_000, "en")).toBe("1M");
    expect(formatCount(2_000, "en")).toBe("2K");
  });

  it("defaults to the English compact notation when no locale is given", () => {
    expect(formatCount(1_200_000)).toBe("1.2M");
  });

  it("formats zero", () => {
    expect(formatCount(0, "en")).toBe("0");
  });
});
