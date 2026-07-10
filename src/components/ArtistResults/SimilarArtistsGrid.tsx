import type { SimilarArtist } from "@/lib/music/types";
import { MediaCard } from "@/components/MediaCard";

interface SimilarArtistsGridProps {
  artists: SimilarArtist[];
}

export function SimilarArtistsGrid({ artists }: SimilarArtistsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {artists.map((artist) => (
        <MediaCard
          key={artist.name}
          title={artist.name}
          subtitle="Similar artist"
          imageUrl={artist.imageUrl}
          url={artist.url}
          imageRounded
        />
      ))}
    </div>
  );
}
