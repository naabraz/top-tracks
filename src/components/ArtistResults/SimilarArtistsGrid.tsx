import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtistCard } from "./SimilarArtistCard";

interface SimilarArtistsGridProps {
  artists: SimilarArtist[];
  onSelect: (name: string) => void;
}

export function SimilarArtistsGrid({ artists, onSelect }: SimilarArtistsGridProps) {
  return (
    <div className="sim-grid">
      {artists.map((artist) => (
        <SimilarArtistCard key={artist.name} artist={artist} onSelect={onSelect} />
      ))}
    </div>
  );
}
