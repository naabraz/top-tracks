/** Domain models rendered by the UI, assembled from Last.fm data. */

export interface ArtistSummary {
  name: string;
  /** Monthly-ish listener count from Last.fm. */
  listeners: number;
  /** Last.fm tags, used in place of genres. */
  tags: string[];
  imageUrl: string | null;
  url: string;
}

export interface TrackSummary {
  name: string;
  artistName: string;
  /** Total play count from Last.fm. */
  playcount: number;
  imageUrl: string | null;
  url: string;
}

export interface AlbumSummary {
  name: string;
  artistName: string;
  playcount: number;
  imageUrl: string | null;
  /** Year of release, from Spotify — Last.fm carries no release date. */
  releaseYear: number | null;
  url: string;
}

export interface SimilarArtist {
  name: string;
  imageUrl: string | null;
  url: string;
}

export interface ArtistLookupResult {
  artist: ArtistSummary;
  topTrack: TrackSummary | null;
  topAlbum: AlbumSummary | null;
  similarArtists: SimilarArtist[];
}
