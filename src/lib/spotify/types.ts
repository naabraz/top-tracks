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
}

export interface TrackItem {
  album: { images: SpotifyImage[] };
}

export interface CachedToken {
  token: string;
  expiresAt: number;
}
