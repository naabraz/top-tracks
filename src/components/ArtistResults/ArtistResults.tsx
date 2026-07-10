import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistHeader } from "./ArtistHeader";
import { ResultSection } from "./ResultSection";
import { PlayCountCard } from "./PlayCountCard";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

interface ArtistResultsProps {
  result: ArtistLookupResult;
  onSelectArtist: (name: string) => void;
}

export function ArtistResults({ result, onSelectArtist }: ArtistResultsProps) {
  const { artist, topTrack, topAlbum, similarArtists } = result;

  return (
    <section className="flex flex-col gap-10" aria-label={`Results for ${artist.name}`}>
      <ArtistHeader artist={artist} />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <ResultSection heading="Most played track" emptyText="No tracks available.">
          {topTrack && <PlayCountCard item={topTrack} />}
        </ResultSection>
        <ResultSection heading="Most played album" emptyText="No albums available.">
          {topAlbum && <PlayCountCard item={topAlbum} />}
        </ResultSection>
      </div>
      <ResultSection heading="Similar artists" emptyText="No similar artists found.">
        {similarArtists.length > 0 && (
          <SimilarArtistsGrid artists={similarArtists} onSelect={onSelectArtist} />
        )}
      </ResultSection>
    </section>
  );
}
