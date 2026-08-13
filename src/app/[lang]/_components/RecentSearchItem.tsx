"use client";

import Link from "next/link";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface RecentSearchItemProps {
  artistName: string;
  href: string;
  onSelect: (artistName: string) => void;
  onRemove: (artistName: string) => void;
}

/**
 * One artist in the trail: a real link back to that search, and a remove
 * control beside it — siblings, never nested, so each is its own target and
 * carries its own accessible name.
 */
export function RecentSearchItem({
  artistName,
  href,
  onSelect,
  onRemove,
}: RecentSearchItemProps) {
  const { dictionary } = useTranslation();

  function handleSelect() {
    onSelect(artistName);
  }

  function handleRemove() {
    onRemove(artistName);
  }

  return (
    <li className="recent-item">
      {/* The screen manages the reveal and fetches the answer client-side, so
          Next needs to neither scroll nor prefetch these ten routes. */}
      <Link href={href} scroll={false} prefetch={false} onClick={handleSelect}>
        {artistName}
      </Link>
      <button
        type="button"
        onClick={handleRemove}
        aria-label={formatMessage(dictionary.recent.removeLabel, { artist: artistName })}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}
