import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import englishDictionary from "./dictionaries/en.json";
import { LocaleProvider } from "./LocaleProvider";
import { useTranslation } from "./useTranslation";

function LocaleLabel() {
  const { locale } = useTranslation();
  return <span>active locale: {locale}</span>;
}

describe("useTranslation", () => {
  it("returns the provider's locale and dictionary", () => {
    render(
      <LocaleProvider locale="pt-BR" dictionary={englishDictionary}>
        <LocaleLabel />
      </LocaleProvider>,
    );

    expect(screen.getByText("active locale: pt-BR")).toBeInTheDocument();
  });

  it("throws a descriptive error outside a provider", () => {
    // React logs the thrown error even when the test catches it; silence the
    // noise without hiding other console output.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<LocaleLabel />)).toThrowError(
      "useTranslation must be used inside a LocaleProvider.",
    );

    consoleError.mockRestore();
  });
});
