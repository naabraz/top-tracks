import {
  getArtistInfo,
  getSimilarArtists,
  getTopAlbum,
  getTopTrack,
} from "@/lib/lastfm/client";
import {
  searchAlbumDetails,
  searchArtistImage,
  searchTrackImage,
} from "@/lib/spotify/images";
import type { ArtistLookupResult } from "./types";

/**
 * Assembles a full result for the given query.
 *
 * Core data (top track, top album, similar artists) comes from Last.fm. Because
 * Last.fm's artist images are placeholders and its track images are unreliable,
 * each entity's artwork is looked up on Spotify by searching for that specific
 * entity — the top track is searched as a track so it gets its own album cover,
 * never a different album's. Image lookups are best-effort and never fail the
 * result. Returns null when the artist cannot be found.
 */
export async function lookupArtist(query: string): Promise<ArtistLookupResult | null> {
  const artist = await getArtistInfo(query);
  if (!artist) {
    return null;
  }

  const [topTrack, topAlbum, similarArtists] = await Promise.all([
    getTopTrack(artist.name),
    getTopAlbum(artist.name),
    getSimilarArtists(artist.name),
  ]);

  const [artistImage, trackImage, albumDetails, similarImages] = await Promise.all([
    searchArtistImage(artist.name),
    topTrack ? searchTrackImage(topTrack.artistName, topTrack.name) : Promise.resolve(null),
    topAlbum ? searchAlbumDetails(topAlbum.artistName, topAlbum.name) : Promise.resolve(null),
    Promise.all(similarArtists.map((similar) => searchArtistImage(similar.name))),
  ]);

  // Prefer Spotify artwork; keep any real Last.fm image as a fallback.
  if (artistImage) {
    artist.imageUrl = artistImage;
  }
  if (topTrack && trackImage) {
    topTrack.imageUrl = trackImage;
  }
  if (topAlbum && albumDetails) {
    topAlbum.imageUrl = albumDetails.imageUrl ?? topAlbum.imageUrl;
    topAlbum.releaseYear = albumDetails.releaseYear;
  }
  similarArtists.forEach((similar, index) => {
    if (similarImages[index]) {
      similar.imageUrl = similarImages[index];
    }
  });

  return { artist, topTrack, topAlbum, similarArtists };
}
