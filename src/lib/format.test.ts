import { describe, expect, it } from "vitest";
import { formatDuration, formatFollowers, formatReleaseYear } from "./format";

describe("formatDuration", () => {
  it("formats a duration under a minute with a leading zero", () => {
    expect(formatDuration(45_000)).toBe("0:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(215_000)).toBe("3:35");
  });

  it("pads single-digit seconds", () => {
    expect(formatDuration(125_000)).toBe("2:05");
  });

  it("rounds to the nearest second", () => {
    expect(formatDuration(59_600)).toBe("1:00");
  });
});

describe("formatFollowers", () => {
  it("returns the raw number below one thousand", () => {
    expect(formatFollowers(742)).toBe("742");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatFollowers(12_300)).toBe("12.3K");
  });

  it("drops a trailing .0", () => {
    expect(formatFollowers(2_000)).toBe("2K");
  });

  it("formats millions with an M suffix", () => {
    expect(formatFollowers(1_200_000)).toBe("1.2M");
  });
});

describe("formatReleaseYear", () => {
  it("extracts the year from a full date", () => {
    expect(formatReleaseYear("1997-06-13")).toBe("1997");
  });

  it("handles a year-only value", () => {
    expect(formatReleaseYear("2021")).toBe("2021");
  });
});
