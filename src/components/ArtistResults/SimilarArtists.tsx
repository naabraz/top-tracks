import type { SimilarArtist } from "@/lib/music/types";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

interface SimilarArtistsProps {
  artists: SimilarArtist[];
  onSelect: (name: string) => void;
}

/** The "if you like them" section: heading, count hint, and the grid. */
export function SimilarArtists({ artists, onSelect }: SimilarArtistsProps) {
  return (
    <div className="similar">
      <div className="sec-head">
        {/* h3, not h4: this section is a sibling of the track and album cards,
            not a subsection of one. */}
        <h3>If you like them, you&rsquo;ll like these too</h3>
        <span className="hint">{artists.length} similar artists</span>
      </div>
      {artists.length > 0 ? (
        <SimilarArtistsGrid artists={artists} onSelect={onSelect} />
      ) : (
        <p className="card-empty">No similar artists found.</p>
      )}
    </div>
  );
}
