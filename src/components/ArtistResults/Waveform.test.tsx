import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Waveform } from "./Waveform";

describe("Waveform", () => {
  it("renders a fixed set of decorative bars", () => {
    const { container } = render(<Waveform seed={9} />);

    expect(container.querySelectorAll(".wave i")).toHaveLength(40);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("renders identical bar heights for the same seed", () => {
    const first = render(<Waveform seed={12} />).container.innerHTML;
    const second = render(<Waveform seed={12} />).container.innerHTML;

    expect(first).toBe(second);
  });
});
