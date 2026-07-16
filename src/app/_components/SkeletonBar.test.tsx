import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SkeletonBar } from "./SkeletonBar";

describe("SkeletonBar", () => {
  it("renders a placeholder sized from its props", () => {
    const { container } = render(<SkeletonBar width="120px" height="40px" />);

    const bar = container.querySelector(".sk");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle({ width: "120px", height: "40px" });
  });

  it("hides the placeholder from assistive technology", () => {
    const { container } = render(<SkeletonBar width="10px" height="10px" />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
