import type { ArtistLookupResult } from "@/lib/music/types";
import type { ArtistCatalog } from "./types";

/**
 * Fixture answers for the end-to-end suite, shaped exactly like `/api/artist`.
 *
 * Every image is null on purpose: the placeholder artwork renders from CSS, so
 * the suite never reaches out to Spotify's CDN through `next/image`.
 */

export const OPETH: ArtistLookupResult = {
  artist: {
    name: "Opeth",
    listeners: 1_240_000,
    tags: ["progressive metal", "death metal", "progressive rock"],
    imageUrl: null,
    url: "https://www.last.fm/music/Opeth",
  },
  topTrack: {
    name: "Windowpane",
    artistName: "Opeth",
    playcount: 2_870_000,
    imageUrl: null,
    albumName: "Damnation",
    albumReleaseYear: 2003,
    url: "https://www.last.fm/music/Opeth/_/Windowpane",
  },
  topAlbum: {
    name: "Blackwater Park",
    artistName: "Opeth",
    playcount: 9_100_000,
    imageUrl: null,
    releaseYear: 2001,
    url: "https://www.last.fm/music/Opeth/Blackwater+Park",
  },
  similarArtists: [
    { name: "Katatonia", imageUrl: null, url: "https://www.last.fm/music/Katatonia" },
    { name: "Porcupine Tree", imageUrl: null, url: "https://www.last.fm/music/Porcupine+Tree" },
    { name: "Enslaved", imageUrl: null, url: "https://www.last.fm/music/Enslaved" },
  ],
};

export const KATATONIA: ArtistLookupResult = {
  artist: {
    name: "Katatonia",
    listeners: 890_000,
    tags: ["doom metal", "gothic metal"],
    imageUrl: null,
    url: "https://www.last.fm/music/Katatonia",
  },
  topTrack: {
    name: "My Twin",
    artistName: "Katatonia",
    playcount: 1_600_000,
    imageUrl: null,
    albumName: "The Great Cold Distance",
    albumReleaseYear: 2006,
    url: "https://www.last.fm/music/Katatonia/_/My+Twin",
  },
  topAlbum: {
    name: "The Great Cold Distance",
    artistName: "Katatonia",
    playcount: 4_300_000,
    imageUrl: null,
    releaseYear: 2006,
    url: "https://www.last.fm/music/Katatonia/The+Great+Cold+Distance",
  },
  similarArtists: [
    { name: "Opeth", imageUrl: null, url: "https://www.last.fm/music/Opeth" },
    { name: "Anathema", imageUrl: null, url: "https://www.last.fm/music/Anathema" },
    { name: "Paradise Lost", imageUrl: null, url: "https://www.last.fm/music/Paradise+Lost" },
  ],
};

/** Anything outside this catalog is answered as a genuine "no artist found". */
export const CATALOG: ArtistCatalog = {
  opeth: OPETH,
  katatonia: KATATONIA,
};

/** A name the catalog will never hold, for exercising the not-found path. */
export const UNKNOWN_ARTIST = "Nonexistent Band";

/**
 * A bare answer for tests that only need an artist to be findable by name —
 * the trail records names, not tracks, so the cards below the fold are noise.
 */
export function buildArtist(name: string): ArtistLookupResult {
  return {
    artist: {
      name,
      listeners: 100_000,
      tags: ["rock"],
      imageUrl: null,
      url: `https://www.last.fm/music/${encodeURIComponent(name)}`,
    },
    topTrack: null,
    topAlbum: null,
    similarArtists: [],
  };
}

/** Builds a catalog from artist names, keyed the way the stub matches them. */
export function buildCatalog(artistNames: string[]): ArtistCatalog {
  return Object.fromEntries(artistNames.map((name) => [name.toLowerCase(), buildArtist(name)]));
}

/** Eleven artists — one more than the trail holds, so the cap is observable. */
export const OVERFLOWING_TRAIL_ARTISTS = [
  "Anathema",
  "Porcupine Tree",
  "Enslaved",
  "Gojira",
  "Mastodon",
  "Baroness",
  "Tool",
  "Meshuggah",
  "Riverside",
  "Leprous",
  "Haken",
];
