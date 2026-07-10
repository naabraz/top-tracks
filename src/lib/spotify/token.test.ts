import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearTokenCache, getAccessToken, SpotifyAuthError } from "./token";

function mockTokenResponse(accessToken: string, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => ({ access_token: accessToken, expires_in: 3600 }),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("SPOTIFY_CLIENT_ID", "client-id");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "client-secret");
});

afterEach(() => {
  clearTokenCache();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getAccessToken", () => {
  it("throws a SpotifyAuthError when the credentials are missing", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "");

    await expect(getAccessToken()).rejects.toBeInstanceOf(SpotifyAuthError);
  });

  it("returns the access token from a successful response", async () => {
    mockTokenResponse("fresh-token");

    await expect(getAccessToken()).resolves.toBe("fresh-token");
  });

  it("sends Basic auth built from the client credentials", async () => {
    mockTokenResponse("fresh-token");

    await getAccessToken();

    const expected = `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`;
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect((options?.headers as Record<string, string>).Authorization).toBe(expected);
  });

  it("caches the token and does not fetch again on the next call", async () => {
    mockTokenResponse("cached-token");

    await getAccessToken();
    await getAccessToken();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fetches a new token after the cache is cleared", async () => {
    mockTokenResponse("cached-token");

    await getAccessToken();
    clearTokenCache();
    await getAccessToken();

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("throws a SpotifyAuthError when the token request fails", async () => {
    mockTokenResponse("unused", false, 401);

    await expect(getAccessToken()).rejects.toBeInstanceOf(SpotifyAuthError);
  });
});
