import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useArtistSearch } from "./useArtistSearch";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useArtistSearch", () => {
  it("starts idle with no result or error", () => {
    const { result } = renderHook(() => useArtistSearch());

    expect(result.current.status).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.errorMessage).toBeNull();
  });

  it("stores the result and marks success on a good response", async () => {
    const payload = { artist: { name: "Radiohead" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => payload }));
    const { result } = renderHook(() => useArtistSearch());

    await act(async () => {
      await result.current.search("radiohead");
    });

    expect(result.current.status).toBe("success");
    expect(result.current.result).toEqual(payload);
  });

  it("surfaces the server error message on a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Not found." }) }),
    );
    const { result } = renderHook(() => useArtistSearch());

    await act(async () => {
      await result.current.search("nobody");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toBe("Not found.");
  });

  it("reports a connection error when the request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const { result } = renderHook(() => useArtistSearch());

    await act(async () => {
      await result.current.search("radiohead");
    });

    expect(result.current.status).toBe("error");
    expect(result.current.errorMessage).toMatch(/could not reach the server/i);
  });
});
