import type { RefObject } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistHeader } from "./ArtistHeader";
import { AlbumCard } from "./AlbumCard";
import { TrackCard } from "./TrackCard";
import { SimilarArtists } from "./SimilarArtists";

interface ArtistResultsProps {
  result: ArtistLookupResult;
  onSelectArtist: (name: string) => void;
  /** Scroll and focus target: how the reader is landed on a new answer. */
  sectionRef?: RefObject<HTMLElement | null>;
  /** True while the next artist loads and this answer is the outgoing one. */
  isStale?: boolean;
}

export function ArtistResults({
  result,
  onSelectArtist,
  sectionRef,
  isStale = false,
}: ArtistResultsProps) {
  const { artist, topTrack, topAlbum, similarArtists } = result;

  return (
    <section
      className="result"
      aria-label={`Results for ${artist.name}`}
      ref={sectionRef}
      tabIndex={-1}
      aria-busy={isStale || undefined}
      data-stale={isStale || undefined}
    >
      <ArtistHeader artist={artist} />
      <div className="grid">
        <AlbumCard album={topAlbum} />
        <TrackCard track={topTrack} />
      </div>
      <SimilarArtists artists={similarArtists} onSelect={onSelectArtist} />
    </section>
  );
}
