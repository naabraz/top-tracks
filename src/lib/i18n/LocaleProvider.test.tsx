import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("server-only", () => ({}));

import englishDictionary from "./dictionaries/en.json";
import portugueseDictionary from "./dictionaries/pt-BR.json";
import { LocaleProvider } from "./LocaleProvider";
import { useTranslation } from "./useTranslation";

function EmptyPrompt() {
  const { dictionary, locale } = useTranslation();
  return (
    <p>
      {locale}: {dictionary.empty.prompt}
    </p>
  );
}

describe("LocaleProvider", () => {
  it("hands children the provided English dictionary and locale via the hook", () => {
    render(
      <LocaleProvider locale="en" dictionary={englishDictionary}>
        <EmptyPrompt />
      </LocaleProvider>,
    );

    expect(screen.getByText("en: Search a band to begin")).toBeInTheDocument();
  });

  it("hands children the provided Portuguese dictionary and locale via the hook", () => {
    render(
      <LocaleProvider locale="pt-BR" dictionary={portugueseDictionary}>
        <EmptyPrompt />
      </LocaleProvider>,
    );

    expect(
      screen.getByText(`pt-BR: ${portugueseDictionary.empty.prompt}`),
    ).toBeInTheDocument();
  });
});
