import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaCardContent } from "./MediaCardContent";

describe("MediaCardContent", () => {
  it("renders the artwork, title, subtitle, and meta", () => {
    render(
      <MediaCardContent
        title="Creep"
        subtitle="Radiohead"
        imageUrl="https://img/creep.jpg"
        meta="1.2M plays"
        imageRounded={false}
      />,
    );

    expect(screen.getByRole("img", { name: "Creep" })).toBeInTheDocument();
    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.getByText("1.2M plays")).toBeInTheDocument();
  });

  it("omits the meta line when no meta is provided", () => {
    render(
      <MediaCardContent title="Muse" subtitle="Similar artist" imageUrl={null} imageRounded />,
    );

    expect(screen.queryByText(/plays/i)).not.toBeInTheDocument();
  });
});
