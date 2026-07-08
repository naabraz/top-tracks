/** Raw Spotify Web API response shapes (only the fields this app consumes). */

export interface SpotifyImage {
  url: string;
  width: number | null;
  height: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  duration_ms: number;
  external_urls: SpotifyExternalUrls;
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
  };
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  popularity?: number;
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
}

export interface SpotifySearchResponse {
  artists: { items: SpotifyArtist[] };
}

export interface SpotifyTopTracksResponse {
  tracks: SpotifyTrack[];
}

export interface SpotifyArtistAlbumsResponse {
  items: SpotifyAlbum[];
}

export interface SpotifyAlbumsResponse {
  albums: SpotifyAlbum[];
}

export interface SpotifyRelatedArtistsResponse {
  artists: SpotifyArtist[];
}

/** Domain models used by the UI. */

export interface ArtistSummary {
  id: string;
  name: string;
  genres: string[];
  followers: number;
  imageUrl: string | null;
  spotifyUrl: string;
}

export interface TrackSummary {
  id: string;
  name: string;
  albumName: string;
  durationMs: number;
  popularity: number;
  imageUrl: string | null;
  spotifyUrl: string;
}

export interface AlbumSummary {
  id: string;
  name: string;
  releaseDate: string;
  totalTracks: number;
  popularity: number;
  imageUrl: string | null;
  spotifyUrl: string;
}

export interface ArtistLookupResult {
  artist: ArtistSummary;
  topTrack: TrackSummary | null;
  topAlbum: AlbumSummary | null;
  similarArtists: ArtistSummary[];
}
