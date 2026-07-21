/** Raw Spotify API response shapes and internal token cache, kept out of the
 * implementation files that use them. */

export interface SpotifyImage {
  url: string;
}

export interface ArtistItem {
  images: SpotifyImage[];
}

export interface AlbumItem {
  images: SpotifyImage[];
  /** ISO-ish date whose precision varies: "1997", "1997-05", or "1997-05-21". */
  release_date?: string;
}

/** What one album search yields: the cover plus the year it came out. */
export interface AlbumDetails {
  imageUrl: string | null;
  releaseYear: number | null;
}

export interface TrackItem {
  album: {
    name?: string;
    images: SpotifyImage[];
    /** ISO-ish date whose precision varies: "1997", "1997-05", or "1997-05-21". */
    release_date?: string;
  };
}

/** What one track search yields: the cover plus the album carrying the track. */
export interface TrackDetails {
  imageUrl: string | null;
  albumName: string | null;
  releaseYear: number | null;
}

export interface CachedToken {
  token: string;
  expiresAt: number;
}
