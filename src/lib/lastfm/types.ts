/** Raw Last.fm API response shapes, kept out of the client implementation. */

export interface LastfmImage {
  "#text": string;
  size: string;
}

export interface RawArtistInfo {
  name: string;
  url: string;
  image?: LastfmImage[];
  stats?: { listeners?: string };
  tags?: { tag?: Array<{ name: string }> };
}

export interface RawTrack {
  name: string;
  playcount?: string;
  url: string;
  image?: LastfmImage[];
  artist?: { name: string };
}

export interface RawAlbum {
  name: string;
  playcount?: string;
  url: string;
  image?: LastfmImage[];
  artist?: { name: string } | string;
}

export interface RawSimilarArtist {
  name: string;
  url: string;
  image?: LastfmImage[];
}
