import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMostPopularAlbum,
  getSimilarArtists,
  getTopTrack,
  lookupArtist,
  searchArtist,
} from "./client";
import { clearTokenCache } from "./token";

/** Queues JSON responses so each fetch call returns the next one in order. */
function mockFetchSequence(responses: Array<{ ok?: boolean; status?: number; body: unknown }>) {
  const fetchMock = vi.fn();
  for (const { ok = true, status = 200, body } of responses) {
    fetchMock.mockResolvedValueOnce({
      ok,
      status,
      json: async () => body,
    });
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const tokenResponse = { body: { access_token: "test-token", expires_in: 3600 } };

function makeArtist(overrides: Record<string, unknown> = {}) {
  return {
    id: "artist-1",
    name: "Radiohead",
    genres: ["alternative rock"],
    popularity: 82,
    followers: { total: 9_000_000 },
    images: [{ url: "https://i.scdn.co/artist.jpg", width: 640, height: 640 }],
    external_urls: { spotify: "https://open.spotify.com/artist/artist-1" },
    ...overrides,
  };
}

beforeEach(() => {
  clearTokenCache();
  process.env.SPOTIFY_CLIENT_ID = "id";
  process.env.SPOTIFY_CLIENT_SECRET = "secret";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("searchArtist", () => {
  it("returns the first matching artist mapped to a summary", async () => {
    mockFetchSequence([tokenResponse, { body: { artists: { items: [makeArtist()] } } }]);

    const artist = await searchArtist("radiohead");

    expect(artist).toEqual({
      id: "artist-1",
      name: "Radiohead",
      genres: ["alternative rock"],
      followers: 9_000_000,
      imageUrl: "https://i.scdn.co/artist.jpg",
      spotifyUrl: "https://open.spotify.com/artist/artist-1",
    });
  });

  it("returns null when there are no matches", async () => {
    mockFetchSequence([tokenResponse, { body: { artists: { items: [] } } }]);

    expect(await searchArtist("no-such-artist")).toBeNull();
  });
});

describe("getTopTrack", () => {
  it("returns the most popular track", async () => {
    mockFetchSequence([
      tokenResponse,
      {
        body: {
          tracks: [
            {
              id: "t1",
              name: "Less Popular",
              popularity: 40,
              duration_ms: 200_000,
              external_urls: { spotify: "url-1" },
              album: { id: "a1", name: "Album One", images: [{ url: "img-1" }] },
            },
            {
              id: "t2",
              name: "Creep",
              popularity: 90,
              duration_ms: 238_000,
              external_urls: { spotify: "url-2" },
              album: { id: "a2", name: "Pablo Honey", images: [{ url: "img-2" }] },
            },
          ],
        },
      },
    ]);

    const track = await getTopTrack("artist-1");

    expect(track?.name).toBe("Creep");
    expect(track?.albumName).toBe("Pablo Honey");
    expect(track?.imageUrl).toBe("img-2");
  });

  it("returns null when the artist has no tracks", async () => {
    mockFetchSequence([tokenResponse, { body: { tracks: [] } }]);

    expect(await getTopTrack("artist-1")).toBeNull();
  });
});

describe("getMostPopularAlbum", () => {
  it("re-fetches album details and returns the most popular one", async () => {
    mockFetchSequence([
      tokenResponse,
      { body: { items: [{ id: "alb-1" }, { id: "alb-2" }] } },
      {
        body: {
          albums: [
            {
              id: "alb-1",
              name: "Amnesiac",
              popularity: 55,
              release_date: "2001-06-05",
              total_tracks: 11,
              images: [{ url: "img-1" }],
              external_urls: { spotify: "url-1" },
            },
            {
              id: "alb-2",
              name: "OK Computer",
              popularity: 80,
              release_date: "1997-06-16",
              total_tracks: 12,
              images: [{ url: "img-2" }],
              external_urls: { spotify: "url-2" },
            },
          ],
        },
      },
    ]);

    const album = await getMostPopularAlbum("artist-1");

    expect(album?.name).toBe("OK Computer");
    expect(album?.totalTracks).toBe(12);
  });

  it("returns null when the artist has no albums", async () => {
    mockFetchSequence([tokenResponse, { body: { items: [] } }]);

    expect(await getMostPopularAlbum("artist-1")).toBeNull();
  });
});

describe("getSimilarArtists", () => {
  it("returns up to three related artists", async () => {
    mockFetchSequence([
      tokenResponse,
      {
        body: {
          artists: [
            makeArtist({ id: "r1", name: "Muse" }),
            makeArtist({ id: "r2", name: "Coldplay" }),
            makeArtist({ id: "r3", name: "Blur" }),
            makeArtist({ id: "r4", name: "Pulp" }),
          ],
        },
      },
    ]);

    const similar = await getSimilarArtists("artist-1", ["alternative rock"]);

    expect(similar.map((a) => a.name)).toEqual(["Muse", "Coldplay", "Blur"]);
  });

  it("falls back to a genre search when related-artists is unavailable", async () => {
    mockFetchSequence([
      tokenResponse,
      { ok: false, status: 404, body: {} },
      {
        body: {
          artists: {
            items: [
              makeArtist({ id: "artist-1", name: "Radiohead (self)" }),
              makeArtist({ id: "g1", name: "Genre Match One" }),
              makeArtist({ id: "g2", name: "Genre Match Two" }),
              makeArtist({ id: "g3", name: "Genre Match Three" }),
            ],
          },
        },
      },
    ]);

    const similar = await getSimilarArtists("artist-1", ["alternative rock"]);

    expect(similar.map((a) => a.name)).toEqual([
      "Genre Match One",
      "Genre Match Two",
      "Genre Match Three",
    ]);
  });

  it("returns an empty list when unavailable and no genre is known", async () => {
    mockFetchSequence([tokenResponse, { ok: false, status: 403, body: {} }]);

    expect(await getSimilarArtists("artist-1", [])).toEqual([]);
  });
});

describe("lookupArtist", () => {
  it("returns null when the artist is not found", async () => {
    mockFetchSequence([tokenResponse, { body: { artists: { items: [] } } }]);

    expect(await lookupArtist("nobody")).toBeNull();
  });
});
