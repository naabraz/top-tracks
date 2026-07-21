import type { ArtistSummary, AlbumSummary, SimilarArtist, TrackSummary } from "@/lib/music/types";
import type {
  LastfmImage,
  RawAlbum,
  RawArtistInfo,
  RawSimilarArtist,
  RawTrack,
} from "./types";

const API_BASE_URL = "https://ws.audioscrobbler.com/2.0/";

/** Last.fm error code returned when an artist name has no match. */
const NOT_FOUND_CODE = 6;

const SIMILAR_ARTISTS_COUNT = 3;

/**
 * Last.fm still serves this placeholder "star" image for entities without real
 * artwork. Treat it as "no image" so the UI shows its own fallback instead.
 */
const PLACEHOLDER_IMAGE_HASH = "2a96cbd8b46e442fc41c2b86b821562f";

export class LastfmError extends Error {
  constructor(
    message: string,
    public readonly code: number | null
  ) {
    super(message);
    this.name = "LastfmError";
  }
}

async function lastfmFetch<T>(method: string, params: Record<string, string>): Promise<T> {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    throw new LastfmError("Missing LASTFM_API_KEY environment variable.", null);
  }

  const query = new URLSearchParams({
    method,
    api_key: apiKey,
    format: "json",
    autocorrect: "1",
    ...params,
  });

  const response = await fetch(`${API_BASE_URL}?${query}`, { cache: "no-store" });
  const data = await response.json();

  if (data && typeof data.error === "number") {
    throw new LastfmError(data.message ?? "Last.fm request failed.", data.error);
  }

  if (!response.ok) {
    throw new LastfmError(`Last.fm request failed with status ${response.status}.`, null);
  }

  return data as T;
}

/** Returns the largest real image URL, skipping Last.fm's placeholder star. */
function pickImage(images: LastfmImage[] | undefined): string | null {
  if (!images) {
    return null;
  }
  for (let i = images.length - 1; i >= 0; i -= 1) {
    const url = images[i]["#text"];
    if (url && !url.includes(PLACEHOLDER_IMAGE_HASH)) {
      return url;
    }
  }
  return null;
}

function parseCount(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveArtistName(artist: RawTrack["artist"] | RawAlbum["artist"]): string {
  if (!artist) {
    return "";
  }
  return typeof artist === "string" ? artist : artist.name;
}

/**
 * Fetches core artist info. Returns null when Last.fm reports the artist does
 * not exist, so callers can surface a clean "not found".
 */
export async function getArtistInfo(query: string): Promise<ArtistSummary | null> {
  let data: { artist?: RawArtistInfo };
  try {
    data = await lastfmFetch("artist.getinfo", { artist: query });
  } catch (error) {
    if (error instanceof LastfmError && error.code === NOT_FOUND_CODE) {
      return null;
    }
    throw error;
  }

  const artist = data.artist;
  if (!artist) {
    return null;
  }

  return {
    name: artist.name,
    listeners: parseCount(artist.stats?.listeners),
    tags: (artist.tags?.tag ?? []).map((tag) => tag.name).slice(0, 3),
    imageUrl: pickImage(artist.image),
    url: artist.url,
  };
}

export async function getTopTrack(artistName: string): Promise<TrackSummary | null> {
  const data = await lastfmFetch<{ toptracks?: { track?: RawTrack[] } }>("artist.gettoptracks", {
    artist: artistName,
    limit: "1",
  });

  const track = data.toptracks?.track?.[0];
  if (!track) {
    return null;
  }

  return {
    name: track.name,
    artistName: resolveArtistName(track.artist) || artistName,
    playcount: parseCount(track.playcount),
    imageUrl: pickImage(track.image),
    // artist.gettoptracks names no album; the lookup fills these from Spotify.
    albumName: null,
    albumReleaseYear: null,
    url: track.url,
  };
}

export async function getTopAlbum(artistName: string): Promise<AlbumSummary | null> {
  const data = await lastfmFetch<{ topalbums?: { album?: RawAlbum[] } }>("artist.gettopalbums", {
    artist: artistName,
    limit: "1",
  });

  const album = data.topalbums?.album?.[0];
  if (!album) {
    return null;
  }

  return {
    name: album.name,
    artistName: resolveArtistName(album.artist) || artistName,
    playcount: parseCount(album.playcount),
    imageUrl: pickImage(album.image),
    // artist.gettopalbums carries no release date; the lookup fills this from
    // Spotify. (album.getinfo only offers a wiki-publication date, which is
    // when someone last edited the page, not when the record came out.)
    releaseYear: null,
    url: album.url,
  };
}

export async function getSimilarArtists(artistName: string): Promise<SimilarArtist[]> {
  const data = await lastfmFetch<{ similarartists?: { artist?: RawSimilarArtist[] } }>(
    "artist.getsimilar",
    { artist: artistName, limit: String(SIMILAR_ARTISTS_COUNT) }
  );

  return (data.similarartists?.artist ?? []).slice(0, SIMILAR_ARTISTS_COUNT).map((artist) => ({
    name: artist.name,
    imageUrl: pickImage(artist.image),
    url: artist.url,
  }));
}
