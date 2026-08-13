"use client";

import { useId } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { RecentSearchItem } from "./RecentSearchItem";

interface RecentSearchesProps {
  entries: readonly string[];
  /** The locale-prefixed path every entry links back through. */
  pathname: string;
  onSelect: (artistName: string) => void;
  onRemove: (artistName: string) => void;
}

/**
 * The reader's trail, under the answer. A reader who has never completed a
 * search sees nothing here — no empty shell and no placeholder — and removing
 * the last entry takes the whole section with it.
 */
export function RecentSearches({
  entries,
  pathname,
  onSelect,
  onRemove,
}: RecentSearchesProps) {
  const { dictionary } = useTranslation();
  const headingId = useId();

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="recent" aria-labelledby={headingId}>
      <h2 id={headingId}>{dictionary.recent.heading}</h2>
      <ul className="recent-list">
        {entries.map((artistName) => (
          <RecentSearchItem
            key={artistName}
            artistName={artistName}
            href={`${pathname}?q=${encodeURIComponent(artistName)}`}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  );
}
