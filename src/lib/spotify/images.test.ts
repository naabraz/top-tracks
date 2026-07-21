import { afterEach, describe, expect, it, vi } from "vitest";
import { searchAlbumDetails, searchArtistImage, searchTrackDetails } from "./images";
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

describe("searchTrackDetails", () => {
  it("returns the track's own album cover, searching by track and artist", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      tracks: { items: [{ album: { images: [{ url: "https://img/countdown.jpg" }] } }] },
    });

    const details = await searchTrackDetails("Megadeth", "Symphony of Destruction");

    expect(details.imageUrl).toBe("https://img/countdown.jpg");
    const [path] = vi.mocked(spotifyFetch).mock.calls[0];
    expect(path).toContain("type=track");
    expect(path).toContain("Symphony+of+Destruction");
    expect(path).toContain("Megadeth");
  });

  it("returns the name and release year of the album carrying the track", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      tracks: {
        items: [
          {
            album: {
              name: "Countdown to Extinction",
              images: [],
              release_date: "1992-07-14",
            },
          },
        ],
      },
    });

    const details = await searchTrackDetails("Megadeth", "Symphony of Destruction");

    expect(details.albumName).toBe("Countdown to Extinction");
    expect(details.releaseYear).toBe(1992);
  });

  it("returns a null year when the album carries no release date", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      tracks: { items: [{ album: { name: "Countdown to Extinction", images: [] } }] },
    });

    const details = await searchTrackDetails("Megadeth", "Symphony of Destruction");

    expect(details.releaseYear).toBeNull();
  });

  it("returns all fields null when the search finds no track", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({ tracks: { items: [] } });

    const details = await searchTrackDetails("Megadeth", "nothing");

    expect(details).toEqual({ imageUrl: null, albumName: null, releaseYear: null });
  });

  it("returns all fields null instead of throwing when the request fails", async () => {
    vi.mocked(spotifyFetch).mockRejectedValue(new Error("rate limited"));

    const details = await searchTrackDetails("Megadeth", "Symphony of Destruction");

    expect(details).toEqual({ imageUrl: null, albumName: null, releaseYear: null });
  });
});

describe("searchAlbumDetails", () => {
  it("returns the first image of the matched album", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      albums: { items: [{ images: [{ url: "https://img/okc.jpg" }] }] },
    });

    const details = await searchAlbumDetails("Radiohead", "OK Computer");

    expect(details.imageUrl).toBe("https://img/okc.jpg");
  });

  it("reads the year from a full release date", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      albums: { items: [{ images: [], release_date: "1997-05-21" }] },
    });

    const details = await searchAlbumDetails("Radiohead", "OK Computer");

    expect(details.releaseYear).toBe(1997);
  });

  it("reads the year from a year-only release date", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      albums: { items: [{ images: [], release_date: "1997" }] },
    });

    const details = await searchAlbumDetails("Radiohead", "OK Computer");

    expect(details.releaseYear).toBe(1997);
  });

  it("returns a null year when the album carries no release date", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({
      albums: { items: [{ images: [] }] },
    });

    const details = await searchAlbumDetails("Radiohead", "OK Computer");

    expect(details.releaseYear).toBeNull();
  });

  it("returns both fields null when the search finds no album", async () => {
    vi.mocked(spotifyFetch).mockResolvedValue({ albums: { items: [] } });

    const details = await searchAlbumDetails("Radiohead", "nothing");

    expect(details).toEqual({ imageUrl: null, releaseYear: null });
  });

  it("returns both fields null instead of throwing when the request fails", async () => {
    vi.mocked(spotifyFetch).mockRejectedValue(new Error("rate limited"));

    const details = await searchAlbumDetails("Radiohead", "OK Computer");

    expect(details).toEqual({ imageUrl: null, releaseYear: null });
  });
});
