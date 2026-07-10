import type { CachedToken } from "./types";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

/** Safety margin so a token is refreshed before it actually expires. */
const EXPIRY_MARGIN_SECONDS = 60;

export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyAuthError";
  }
}

let cachedToken: CachedToken | null = null;

/**
 * Fetches an app-level access token using the Client Credentials flow.
 * Tokens are cached in module scope and reused until shortly before expiry.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new SpotifyAuthError(
      "Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET environment variables."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SpotifyAuthError(
      `Spotify token request failed with status ${response.status}. ` +
        "Check that your client ID and secret are valid."
    );
  }

  const data: { access_token: string; expires_in: number } = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - EXPIRY_MARGIN_SECONDS) * 1000,
  };

  return cachedToken.token;
}

/** Test helper: resets the in-memory token cache. */
export function clearTokenCache(): void {
  cachedToken = null;
}
