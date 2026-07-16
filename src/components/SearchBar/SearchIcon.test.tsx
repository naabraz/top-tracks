import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { SearchIcon } from "./SearchIcon";

describe("SearchIcon", () => {
  it("renders a decorative icon hidden from assistive technology", () => {
    const { container } = render(<SearchIcon />);

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
