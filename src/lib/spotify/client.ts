import { getAccessToken } from "./token";
import type {
  AlbumSummary,
  ArtistLookupResult,
  ArtistSummary,
  SpotifyAlbum,
  SpotifyAlbumsResponse,
  SpotifyArtist,
  SpotifyArtistAlbumsResponse,
  SpotifyRelatedArtistsResponse,
  SpotifySearchResponse,
  SpotifyTopTracksResponse,
  SpotifyTrack,
  TrackSummary,
} from "./types";

const API_BASE_URL = "https://api.spotify.com/v1";

/** Market used for top-tracks lookups (required by the endpoint). */
const DEFAULT_MARKET = "US";

const SIMILAR_ARTISTS_COUNT = 3;

export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "SpotifyApiError";
  }
}

async function spotifyFetch<T>(path: string): Promise<T> {
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

function pickImageUrl(images: { url: string }[]): string | null {
  return images[0]?.url ?? null;
}

function toArtistSummary(artist: SpotifyArtist): ArtistSummary {
  return {
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    followers: artist.followers.total,
    imageUrl: pickImageUrl(artist.images),
    spotifyUrl: artist.external_urls.spotify,
  };
}

function toTrackSummary(track: SpotifyTrack): TrackSummary {
  return {
    id: track.id,
    name: track.name,
    albumName: track.album.name,
    durationMs: track.duration_ms,
    popularity: track.popularity,
    imageUrl: pickImageUrl(track.album.images),
    spotifyUrl: track.external_urls.spotify,
  };
}

function toAlbumSummary(album: SpotifyAlbum): AlbumSummary {
  return {
    id: album.id,
    name: album.name,
    releaseDate: album.release_date,
    totalTracks: album.total_tracks,
    popularity: album.popularity ?? 0,
    imageUrl: pickImageUrl(album.images),
    spotifyUrl: album.external_urls.spotify,
  };
}

/** Returns the best artist match for the query, or null when nothing matches. */
export async function searchArtist(query: string): Promise<ArtistSummary | null> {
  const params = new URLSearchParams({ q: query, type: "artist", limit: "1" });
  const data = await spotifyFetch<SpotifySearchResponse>(`/search?${params}`);
  const artist = data.artists.items[0];
  return artist ? toArtistSummary(artist) : null;
}

/** Returns the artist's most popular track, or null when they have none. */
export async function getTopTrack(artistId: string): Promise<TrackSummary | null> {
  const data = await spotifyFetch<SpotifyTopTracksResponse>(
    `/artists/${artistId}/top-tracks?market=${DEFAULT_MARKET}`
  );

  if (data.tracks.length === 0) {
    return null;
  }

  const topTrack = data.tracks.reduce((best, track) =>
    track.popularity > best.popularity ? track : best
  );
  return toTrackSummary(topTrack);
}

/**
 * Returns the artist's most popular album.
 *
 * The artist-albums endpoint does not include popularity, so the candidate
 * albums are re-fetched in a single batch request (which does include it)
 * and ranked by that score.
 */
export async function getMostPopularAlbum(artistId: string): Promise<AlbumSummary | null> {
  const params = new URLSearchParams({
    include_groups: "album",
    market: DEFAULT_MARKET,
    limit: "20",
  });
  const albumList = await spotifyFetch<SpotifyArtistAlbumsResponse>(
    `/artists/${artistId}/albums?${params}`
  );

  if (albumList.items.length === 0) {
    return null;
  }

  const ids = albumList.items.map((album) => album.id).join(",");
  const detailed = await spotifyFetch<SpotifyAlbumsResponse>(`/albums?ids=${ids}`);

  const topAlbum = detailed.albums.reduce((best, album) =>
    (album.popularity ?? 0) > (best.popularity ?? 0) ? album : best
  );
  return toAlbumSummary(topAlbum);
}

/**
 * Returns up to three artists similar to the given one.
 *
 * Prefers the related-artists endpoint; Spotify deprecated it for apps
 * created after November 2024, so when it responds with 403/404 this falls
 * back to searching for other artists in the same genre.
 */
export async function getSimilarArtists(
  artistId: string,
  genres: string[]
): Promise<ArtistSummary[]> {
  try {
    const data = await spotifyFetch<SpotifyRelatedArtistsResponse>(
      `/artists/${artistId}/related-artists`
    );
    return data.artists.slice(0, SIMILAR_ARTISTS_COUNT).map(toArtistSummary);
  } catch (error) {
    const isEndpointUnavailable =
      error instanceof SpotifyApiError && (error.status === 403 || error.status === 404);
    if (!isEndpointUnavailable || genres.length === 0) {
      if (isEndpointUnavailable) {
        return [];
      }
      throw error;
    }
  }

  return searchArtistsByGenre(genres[0], artistId);
}

async function searchArtistsByGenre(
  genre: string,
  excludeArtistId: string
): Promise<ArtistSummary[]> {
  const params = new URLSearchParams({
    q: `genre:"${genre}"`,
    type: "artist",
    limit: String(SIMILAR_ARTISTS_COUNT + 1),
  });
  const data = await spotifyFetch<SpotifySearchResponse>(`/search?${params}`);

  return data.artists.items
    .filter((artist) => artist.id !== excludeArtistId)
    .slice(0, SIMILAR_ARTISTS_COUNT)
    .map(toArtistSummary);
}

/** Fetches everything the results page needs for a given search query. */
export async function lookupArtist(query: string): Promise<ArtistLookupResult | null> {
  const artist = await searchArtist(query);

  if (!artist) {
    return null;
  }

  const [topTrack, topAlbum, similarArtists] = await Promise.all([
    getTopTrack(artist.id),
    getMostPopularAlbum(artist.id),
    getSimilarArtists(artist.id, artist.genres),
  ]);

  return { artist, topTrack, topAlbum, similarArtists };
}
