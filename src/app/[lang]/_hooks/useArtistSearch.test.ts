import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useArtistSearch } from "./useArtistSearch";

/** Renders the hook with a query the test can move. */
function renderSearch(initialQuery = "") {
  return renderHook(({ query }) => useArtistSearch(query), {
    initialProps: { query: initialQuery },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useArtistSearch", () => {
  it("stays idle while the query is empty", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderSearch("");

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.errorCode).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stays idle for a whitespace-only query", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    renderSearch("   ");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores the result and marks success with a null errorCode on a good response", async () => {
    const payload = { artist: { name: "Radiohead" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));

    const { result } = renderSearch("radiohead");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.result).toEqual(payload);
    expect(result.current.errorCode).toBeNull();
  });

  it("exposes a null errorCode while a lookup is loading", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    const { result } = renderSearch("radiohead");

    expect(result.current.status).toBe("loading");
    expect(result.current.errorCode).toBeNull();
  });

  it("surfaces the body's code as errorCode on a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ code: "not-found" }) }),
    );

    const { result } = renderSearch("nobody");

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorCode).toBe("not-found");
  });

  it("yields unexpected-error for a failed response without a parsable code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "legacy body" }) }),
    );

    const { result } = renderSearch("nobody");

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorCode).toBe("unexpected-error");
  });

  it("yields unexpected-error for a failed response whose body is not JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    const { result } = renderSearch("nobody");

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorCode).toBe("unexpected-error");
  });

  it("yields network-error when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { result } = renderSearch("radiohead");

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.errorCode).toBe("network-error");
  });

  it("returns to idle when the query is cleared", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ artist: { name: "Muse" } }) }),
    );

    const { result, rerender } = renderSearch("muse");
    await waitFor(() => expect(result.current.status).toBe("success"));

    rerender({ query: "" });

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
  });

  it("keeps the previous result on screen while the next artist loads", async () => {
    const first = { artist: { name: "Radiohead" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => first }));

    const { result, rerender } = renderSearch("radiohead");
    await waitFor(() => expect(result.current.status).toBe("success"));

    // A never-settling request stands in for the next lookup, still in flight.
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
    rerender({ query: "muse" });

    await waitFor(() => expect(result.current.status).toBe("loading"));
    expect(result.current.result).toEqual(first);
  });

  it("ignores a slow response once the query has moved on", async () => {
    const slow = { artist: { name: "Radiohead" } };
    const fast = { artist: { name: "Muse" } };

    let landSlowResponse: () => void = () => {};
    const slowResponse = new Promise((resolve) => {
      landSlowResponse = () => resolve({ ok: true, json: async () => slow });
    });

    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) =>
        url.includes("radiohead")
          ? slowResponse
          : Promise.resolve({ ok: true, json: async () => fast }),
      ),
    );

    const { result, rerender } = renderSearch("radiohead");
    rerender({ query: "muse" });
    await waitFor(() => expect(result.current.result).toEqual(fast));

    // The abandoned lookup lands late; it must not overwrite the newer artist.
    landSlowResponse();
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(result.current.result).toEqual(fast);
  });
});
