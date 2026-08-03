import { describe, expect, it } from "vitest";
import { hasLocale, negotiateLocale } from "./locales";

describe("hasLocale", () => {
  it("accepts the supported locales", () => {
    expect(hasLocale("en")).toBe(true);
    expect(hasLocale("pt-BR")).toBe(true);
  });

  it("rejects an unsupported locale", () => {
    expect(hasLocale("fr")).toBe(false);
  });

  it("rejects the bare language code of a supported regional locale", () => {
    expect(hasLocale("pt")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(hasLocale("")).toBe(false);
  });
});

describe("negotiateLocale", () => {
  it("returns the cookie locale when the cookie holds a supported value, regardless of the header", () => {
    expect(negotiateLocale("en-US,en;q=0.9", "pt-BR")).toBe("pt-BR");
  });

  it("ignores an unsupported cookie value and falls through to the header", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9", "fr")).toBe("pt-BR");
  });

  it("returns pt-BR for a header preferring pt", () => {
    expect(negotiateLocale("pt,en;q=0.8", null)).toBe("pt-BR");
  });

  it("returns pt-BR for a header preferring pt-BR", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9,en;q=0.8", null)).toBe("pt-BR");
  });

  it("returns pt-BR for a header preferring pt-PT", () => {
    expect(negotiateLocale("pt-PT,pt;q=0.9", null)).toBe("pt-BR");
  });

  it("returns en for an English header", () => {
    expect(negotiateLocale("en-US,en;q=0.9", null)).toBe("en");
  });

  it("returns en for a header with only unsupported languages", () => {
    expect(negotiateLocale("fr-FR,fr;q=0.9,de;q=0.8", null)).toBe("en");
  });

  it("returns en for a malformed header", () => {
    expect(negotiateLocale(";;;,,q=", null)).toBe("en");
  });

  it("returns en when the header is absent", () => {
    expect(negotiateLocale(null, null)).toBe("en");
  });
});
