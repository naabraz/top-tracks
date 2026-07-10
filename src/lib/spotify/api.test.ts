import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { spotifyFetch, SpotifyApiError } from "./api";
import { getAccessToken } from "./token";

vi.mock("./token", () => ({ getAccessToken: vi.fn() }));

beforeEach(() => {
  vi.mocked(getAccessToken).mockResolvedValue("access-token");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("spotifyFetch", () => {
  it("returns the parsed JSON body on a successful response", async () => {
    const body = { artists: { items: [] } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));

    await expect(spotifyFetch("/search?q=muse")).resolves.toEqual(body);
  });

  it("calls the Spotify API with a Bearer token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    await spotifyFetch("/search?q=muse");

    const [url, options] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://api.spotify.com/v1/search?q=muse");
    expect((options?.headers as Record<string, string>).Authorization).toBe("Bearer access-token");
  });

  it("throws a SpotifyApiError carrying the status on a non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    await expect(spotifyFetch("/search?q=muse")).rejects.toMatchObject({
      name: "SpotifyApiError",
      status: 403,
    });
    await expect(spotifyFetch("/search?q=muse")).rejects.toBeInstanceOf(SpotifyApiError);
  });
});
