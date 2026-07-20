import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getArtistInfo,
  getSimilarArtists,
  getTopAlbum,
  getTopTrack,
  LastfmError,
} from "./client";

const PLACEHOLDER =
  "https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png";

function mockJson(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, status, json: async () => body })
  );
}

beforeEach(() => {
  process.env.LASTFM_API_KEY = "test-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getArtistInfo", () => {
  it("maps stats, tags, and image", async () => {
    mockJson({
      artist: {
        name: "Radiohead",
        url: "https://last.fm/music/Radiohead",
        stats: { listeners: "5300000" },
        tags: { tag: [{ name: "alternative" }, { name: "rock" }, { name: "indie" }, { name: "90s" }] },
        image: [{ "#text": "https://img/large.png", size: "large" }],
      },
    });

    const artist = await getArtistInfo("radiohead");

    expect(artist).toEqual({
      name: "Radiohead",
      listeners: 5_300_000,
      tags: ["alternative", "rock", "indie"],
      imageUrl: "https://img/large.png",
      url: "https://last.fm/music/Radiohead",
    });
  });

  it("returns null when Last.fm reports the artist is not found", async () => {
    mockJson({ error: 6, message: "The artist you supplied could not be found" });

    expect(await getArtistInfo("asdkjhaskdjh")).toBeNull();
  });

  it("treats the placeholder star image as no image", async () => {
    mockJson({
      artist: {
        name: "Obscure",
        url: "https://last.fm/music/Obscure",
        stats: { listeners: "10" },
        image: [{ "#text": PLACEHOLDER, size: "large" }],
      },
    });

    const artist = await getArtistInfo("obscure");
    expect(artist?.imageUrl).toBeNull();
  });

  it("throws LastfmError for non-not-found errors", async () => {
    mockJson({ error: 10, message: "Invalid API key" });

    await expect(getArtistInfo("radiohead")).rejects.toBeInstanceOf(LastfmError);
  });

  it("throws when the API key is missing", async () => {
    delete process.env.LASTFM_API_KEY;
    mockJson({ artist: { name: "x", url: "u" } });

    await expect(getArtistInfo("x")).rejects.toThrow(/LASTFM_API_KEY/);
  });
});

describe("getTopTrack", () => {
  it("returns the first (most played) track", async () => {
    mockJson({
      toptracks: {
        track: [
          {
            name: "Creep",
            playcount: "12000000",
            url: "https://last.fm/creep",
            artist: { name: "Radiohead" },
            image: [{ "#text": "https://img/creep.png", size: "large" }],
          },
        ],
      },
    });

    const track = await getTopTrack("Radiohead");

    expect(track).toEqual({
      name: "Creep",
      artistName: "Radiohead",
      playcount: 12_000_000,
      imageUrl: "https://img/creep.png",
      url: "https://last.fm/creep",
    });
  });

  it("returns null when there are no tracks", async () => {
    mockJson({ toptracks: { track: [] } });
    expect(await getTopTrack("Nobody")).toBeNull();
  });
});

describe("getTopAlbum", () => {
  it("returns the first album and handles a string artist field", async () => {
    mockJson({
      topalbums: {
        album: [
          {
            name: "OK Computer",
            playcount: "8000000",
            url: "https://last.fm/okc",
            artist: "Radiohead",
            image: [{ "#text": "https://img/okc.png", size: "extralarge" }],
          },
        ],
      },
    });

    const album = await getTopAlbum("Radiohead");

    expect(album?.name).toBe("OK Computer");
    expect(album?.artistName).toBe("Radiohead");
    expect(album?.playcount).toBe(8_000_000);
  });

  it("leaves the release year null, since Last.fm does not report one", async () => {
    mockJson({
      topalbums: {
        album: [{ name: "OK Computer", playcount: "8000000", url: "u", artist: "Radiohead" }],
      },
    });

    const album = await getTopAlbum("Radiohead");

    expect(album?.releaseYear).toBeNull();
  });
});

describe("getSimilarArtists", () => {
  it("returns up to three similar artists", async () => {
    mockJson({
      similarartists: {
        artist: [
          { name: "Muse", url: "u1", image: [{ "#text": "i1", size: "large" }] },
          { name: "Coldplay", url: "u2", image: [{ "#text": PLACEHOLDER, size: "large" }] },
          { name: "Blur", url: "u3", image: [] },
          { name: "Pulp", url: "u4", image: [] },
        ],
      },
    });

    const similar = await getSimilarArtists("Radiohead");

    expect(similar).toHaveLength(3);
    expect(similar.map((a) => a.name)).toEqual(["Muse", "Coldplay", "Blur"]);
    expect(similar[0].imageUrl).toBe("i1");
    expect(similar[1].imageUrl).toBeNull();
  });

  it("returns an empty array when none are found", async () => {
    mockJson({ similarartists: { artist: [] } });
    expect(await getSimilarArtists("Nobody")).toEqual([]);
  });
});
