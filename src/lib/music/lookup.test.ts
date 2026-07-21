import { afterEach, describe, expect, it, vi } from "vitest";
import { lookupArtist } from "./lookup";
import * as lastfm from "@/lib/lastfm/client";
import * as images from "@/lib/spotify/images";

vi.mock("@/lib/lastfm/client");
vi.mock("@/lib/spotify/images");

const artist = {
  name: "Radiohead",
  listeners: 5_000_000,
  tags: ["rock"],
  imageUrl: null,
  url: "https://last.fm/radiohead",
};

const track = {
  name: "Creep",
  artistName: "Radiohead",
  playcount: 100,
  imageUrl: null,
  albumName: null,
  albumReleaseYear: null,
  url: "https://last.fm/creep",
};

const emptyTrackDetails = { imageUrl: null, albumName: null, releaseYear: null };

const album = {
  name: "OK Computer",
  artistName: "Radiohead",
  playcount: 200,
  imageUrl: null,
  releaseYear: null,
  url: "https://last.fm/okc",
};

function mockNoImages() {
  vi.mocked(images.searchArtistImage).mockResolvedValue(null);
  vi.mocked(images.searchTrackDetails).mockResolvedValue({ ...emptyTrackDetails });
  vi.mocked(images.searchAlbumDetails).mockResolvedValue({ imageUrl: null, releaseYear: null });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lookupArtist", () => {
  it("returns null when the artist is not found", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue(null);

    expect(await lookupArtist("nobody")).toBeNull();
  });

  it("enriches each entity with its own Spotify image", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({ ...track });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({ ...album });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([
      { name: "Muse", imageUrl: null, url: "https://last.fm/muse" },
    ]);
    vi.mocked(images.searchArtistImage).mockImplementation(async (name) =>
      name === "Radiohead" ? "https://img/artist.jpg" : "https://img/muse.jpg"
    );
    vi.mocked(images.searchTrackDetails).mockResolvedValue({
      ...emptyTrackDetails,
      imageUrl: "https://img/creep-album.jpg",
    });
    vi.mocked(images.searchAlbumDetails).mockResolvedValue({
      imageUrl: "https://img/okc.jpg",
      releaseYear: 1997,
    });

    const result = await lookupArtist("radiohead");

    expect(result?.artist.imageUrl).toBe("https://img/artist.jpg");
    expect(result?.topTrack?.imageUrl).toBe("https://img/creep-album.jpg");
    expect(result?.topAlbum?.imageUrl).toBe("https://img/okc.jpg");
    expect(result?.similarArtists[0].imageUrl).toBe("https://img/muse.jpg");
  });

  it("fills the track's album name and release year from Spotify", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({ ...track });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({ ...album });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);
    mockNoImages();
    vi.mocked(images.searchTrackDetails).mockResolvedValue({
      imageUrl: null,
      albumName: "Pablo Honey",
      releaseYear: 1993,
    });

    const result = await lookupArtist("radiohead");

    expect(result?.topTrack?.albumName).toBe("Pablo Honey");
    expect(result?.topTrack?.albumReleaseYear).toBe(1993);
  });

  it("fills the album's release year from Spotify", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({ ...track });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({ ...album });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);
    mockNoImages();
    vi.mocked(images.searchAlbumDetails).mockResolvedValue({
      imageUrl: null,
      releaseYear: 1997,
    });

    const result = await lookupArtist("radiohead");

    expect(result?.topAlbum?.releaseYear).toBe(1997);
  });

  it("keeps a real Last.fm cover when Spotify matches the album but has no image", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({ ...track });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({
      ...album,
      imageUrl: "https://lastfm/okc.jpg",
    });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);
    mockNoImages();

    const result = await lookupArtist("radiohead");

    expect(result?.topAlbum?.imageUrl).toBe("https://lastfm/okc.jpg");
  });

  it("looks up the track's own artwork, not the top album's", async () => {
    // Regression: the top track (from Countdown to Extinction) must not inherit
    // the top album's cover (Rust in Peace).
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist, name: "Megadeth" });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({
      ...track,
      name: "Symphony of Destruction",
      artistName: "Megadeth",
    });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({ ...album, name: "Rust in Peace" });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);
    mockNoImages();
    vi.mocked(images.searchTrackDetails).mockResolvedValue({
      ...emptyTrackDetails,
      imageUrl: "https://img/countdown.jpg",
    });

    const result = await lookupArtist("megadeth");

    expect(images.searchTrackDetails).toHaveBeenCalledWith("Megadeth", "Symphony of Destruction");
    expect(result?.topTrack?.imageUrl).toBe("https://img/countdown.jpg");
  });

  it("leaves images null when Spotify finds nothing", async () => {
    vi.mocked(lastfm.getArtistInfo).mockResolvedValue({ ...artist });
    vi.mocked(lastfm.getTopTrack).mockResolvedValue({ ...track });
    vi.mocked(lastfm.getTopAlbum).mockResolvedValue({ ...album });
    vi.mocked(lastfm.getSimilarArtists).mockResolvedValue([]);
    mockNoImages();

    const result = await lookupArtist("radiohead");

    expect(result?.artist.imageUrl).toBeNull();
    expect(result?.topTrack?.imageUrl).toBeNull();
  });
});
