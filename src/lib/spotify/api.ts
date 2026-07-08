import { getAccessToken } from "./token";

const API_BASE_URL = "https://api.spotify.com/v1";

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

export async function spotifyFetch<T>(path: string): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SpotifyApiError(
      `Spotify API request to ${path} failed with status ${response.status}.`,
      response.status
    );
  }

  return response.json();
}
