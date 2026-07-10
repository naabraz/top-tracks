import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAlbumImage, searchArtistImage, searchTrackImage } from "./images";
import { spotifyFetch } from "./api";

vi.mock("./api", () => ({ spotifyFetch: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("searchArtistImage", () => {
  it("returns the first image of the matched artist", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      artists: { items: [{ images: [{ url: "https://img/artist.jpg" }] }] },
    });

    await expect(searchArtistImage("Radiohead")).resolves.toBe("https://img/artist.jpg");
  });

  it("returns null when the search finds no artist", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({ artists: { items: [] } });

    await expect(searchArtistImage("nobody")).resolves.toBeNull();
  });

  it("returns null instead of throwing when the request fails", async () => {
    vi.mocked(spotifyFetch).mockRejectedValue(new Error("rate limited"));

    await expect(searchArtistImage("Radiohead")).resolves.toBeNull();
  });
});

describe("searchTrackImage", () => {
  it("returns the track's own album cover, searching by track and artist", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      tracks: { items: [{ album: { images: [{ url: "https://img/countdown.jpg" }] } }] },
    });

    await expect(searchTrackImage("Megadeth", "Symphony of Destruction")).resolves.toBe(
      "https://img/countdown.jpg",
    );

    const [path] = vi.mocked(spotifyFetch).mock.calls[0];
    expect(path).toContain("type=track");
    expect(path).toContain("Symphony+of+Destruction");
    expect(path).toContain("Megadeth");
  });

  it("returns null when the track has no album image", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({ tracks: { items: [] } });

    await expect(searchTrackImage("Megadeth", "Symphony of Destruction")).resolves.toBeNull();
  });
});

describe("searchAlbumImage", () => {
  it("returns the first image of the matched album", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      albums: { items: [{ images: [{ url: "https://img/okc.jpg" }] }] },
    });

    await expect(searchAlbumImage("Radiohead", "OK Computer")).resolves.toBe("https://img/okc.jpg");
  });
});
