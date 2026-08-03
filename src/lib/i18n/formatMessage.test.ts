import { describe, expect, it } from "vitest";
import { formatMessage } from "./formatMessage";

describe("formatMessage", () => {
  it("replaces a single placeholder with its value", () => {
    const message = formatMessage("Results for {artist}", { artist: "Opeth" });

    expect(message).toBe("Results for Opeth");
  });

  it("replaces multiple distinct placeholders in one template", () => {
    const message = formatMessage("{count} listeners on {service}", {
      count: 42,
      service: "Last.fm",
    });

    expect(message).toBe("42 listeners on Last.fm");
  });

  it("leaves a placeholder literal when no value is provided", () => {
    const message = formatMessage('No artist found matching "{query}".');

    expect(message).toBe('No artist found matching "{query}".');
  });

  it("returns a template with no placeholders unchanged", () => {
    const message = formatMessage("Search a band to begin", { artist: "Opeth" });

    expect(message).toBe("Search a band to begin");
  });
});
