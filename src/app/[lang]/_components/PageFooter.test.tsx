import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import en from "@/lib/i18n/dictionaries/en.json";
import ptBR from "@/lib/i18n/dictionaries/pt-BR.json";
import { PageFooter } from "./PageFooter";

describe("PageFooter", () => {
  it("credits Last.fm and Spotify with links", () => {
    render(<PageFooter footer={en.footer} />);

    expect(screen.getByRole("link", { name: "Last.fm" })).toHaveAttribute(
      "href",
      "https://www.last.fm",
    );
    expect(screen.getByRole("link", { name: "Spotify" })).toHaveAttribute(
      "href",
      "https://www.spotify.com",
    );
  });

  it("renders the Portuguese sources heading for pt-BR", () => {
    render(<PageFooter footer={ptBR.footer} />);

    expect(screen.getByText("De onde vêm os dados")).toBeInTheDocument();
  });

  it("keeps the brand tagline in English under pt-BR, as part of the wordmark", () => {
    render(<PageFooter footer={ptBR.footer} />);

    expect(screen.getByText("TopTracks · band discovery")).toBeInTheDocument();
  });
});
