"use client";

import type { SimilarArtist } from "@/lib/music/types";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SimilarArtistsGrid } from "./SimilarArtistsGrid";

interface SimilarArtistsProps {
  artists: SimilarArtist[];
  onSelect: (name: string) => void;
}

/** The "if you like them" section: heading, count hint, and the grid. */
export function SimilarArtists({ artists, onSelect }: SimilarArtistsProps) {
  const { dictionary } = useTranslation();

  return (
    <div className="similar">
      <div className="sec-head">
        {/* h3, not h4: this section is a sibling of the track and album cards,
            not a subsection of one. */}
        <h3>{dictionary.results.similarHeading}</h3>
        <span className="hint">
          {formatMessage(dictionary.results.similarCount, { count: artists.length })}
        </span>
      </div>
      {artists.length > 0 ? (
        <SimilarArtistsGrid artists={artists} onSelect={onSelect} />
      ) : (
        <p className="card-empty">{dictionary.results.noSimilar}</p>
      )}
    </div>
  );
}
