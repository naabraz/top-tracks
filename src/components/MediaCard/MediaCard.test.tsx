import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaCard } from "./MediaCard";

describe("MediaCard", () => {
  it("renders an external link with title, subtitle, and meta when given a url", () => {
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

  it("renders a button that calls onSelect with the title when selectable", async () => {
    const onSelect = vi.fn();
    render(<MediaCard title="Muse" subtitle="Similar artist" imageUrl={null} onSelect={onSelect} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /muse/i }));

    expect(onSelect).toHaveBeenCalledWith("Muse");
  });
});
