import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupArtist } from "./lookup";
import * as lastfm from "@/lib/lastfm/client";

vi.mock("@/lib/lastfm/client");

const artist = {
  name: "Radiohead",
  listeners: 5_000_000,
  tags: ["rock"],
  imageUrl: "https://img/artist.png",
  url: "https://last.fm/radiohead",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lookupArtist", () => {
  it("returns null when the artist is not found", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue(null);

    expect(await lookupArtist("nobody")).toBeNull();
  });

  it("combines the artist with its top track, album, and similar artists", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue(artist);
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({
      name: "Creep",
      artistName: "Radiohead",
      playcount: 100,
      imageUrl: "https://img/creep.png",
      url: "https://last.fm/creep",
    });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({
      name: "OK Computer",
      artistName: "Radiohead",
      playcount: 200,
      imageUrl: "https://img/okc.png",
      url: "https://last.fm/okc",
    });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([
      { name: "Muse", imageUrl: null, url: "https://last.fm/muse" },
    ]);

    const result = await lookupArtist("radiohead");

    expect(result?.artist.name).toBe("Radiohead");
    expect(result?.topTrack?.name).toBe("Creep");
    expect(result?.topAlbum?.name).toBe("OK Computer");
    expect(result?.similarArtists).toHaveLength(1);
  });

  it("falls back to the album image when the track has none", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue(artist);
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({
      name: "Creep",
      artistName: "Radiohead",
      playcount: 100,
      imageUrl: null,
      url: "https://last.fm/creep",
    });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({
      name: "OK Computer",
      artistName: "Radiohead",
      playcount: 200,
      imageUrl: "https://img/okc.png",
      url: "https://last.fm/okc",
    });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);

    const result = await lookupArtist("radiohead");

    expect(result?.topTrack?.imageUrl).toBe("https://img/okc.png");
  });
});
