import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the brand name and tagline", () => {
    render(<SiteHeader locale="en" header={en.header} />);

    expect(screen.getByText("TopTracks")).toBeInTheDocument();
    expect(screen.getByText("band discovery")).toBeInTheDocument();
  });

  it("links the brand to the active locale's home", () => {
    render(<SiteHeader locale="pt-BR" header={ptBR.header} />);

    expect(screen.getByRole("link", { name: ptBR.header.homeLinkLabel })).toHaveAttribute(
      "href",
      "/pt-BR",
    );
  });

  it("keeps the tagline in English under pt-BR, as part of the wordmark", () => {
    render(<SiteHeader locale="pt-BR" header={ptBR.header} />);

    expect(screen.getByText("band discovery")).toBeInTheDocument();
  });
});
