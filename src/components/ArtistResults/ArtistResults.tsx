import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistHeader } from "./ArtistHeader";
import { AlbumCard } from "./AlbumCard";
import { TrackCard } from "./TrackCard";
import { SimilarArtists } from "./SimilarArtists";

interface ArtistResultsProps {
  result: ArtistLookupResult;
  onSelectArtist: (name: string) => void;
}

export function ArtistResults({ result, onSelectArtist }: ArtistResultsProps) {
  const { artist, topTrack, topAlbum, similarArtists } = result;

  return (
    <section className="result" aria-label={`Results for ${artist.name}`}>
      <ArtistHeader artist={artist} />
      <div className="grid">
        <AlbumCard album={topAlbum} />
        <TrackCard track={topTrack} />
      </div>
      <SimilarArtists artists={similarArtists} onSelect={onSelectArtist} />
    </section>
  );
}
