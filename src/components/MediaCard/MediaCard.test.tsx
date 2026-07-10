import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCard } from "./MediaCard";

describe("MediaCard", () => {
  it("renders the title, subtitle, and meta inside a link to the url", () => {
    render(
      <MediaCard
        title="Creep"
        subtitle="Radiohead"
        imageUrl="https://img/creep.jpg"
        url="https://last.fm/creep"
        meta="1.2M plays"
      />,
    );

    const link = screen.getByRole("link", { name: /creep/i });
    expect(link).toHaveAttribute("href", "https://last.fm/creep");
    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.getByText("1.2M plays")).toBeInTheDocument();
  });

  it("omits the meta line when no meta is provided", () => {
    render(
      <MediaCard title="Muse" subtitle="Similar artist" imageUrl={null} url="https://last.fm/muse" />,
    );

    expect(screen.queryByText(/plays/i)).not.toBeInTheDocument();
  });
});
