"use client";

import type { ArtistSummary } from "@/lib/music/types";
import { formatNumber } from "@/lib/format";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ArtistTags } from "./ArtistTags";

interface ArtistHeaderProps {
  artist: ArtistSummary;
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  const { dictionary, locale } = useTranslation();
  // The count is bold but its surrounding words are not, so the template is
  // split around the placeholder instead of interpolated as one string.
  const [listenersPrefix, listenersSuffix] = dictionary.results.listeners.split("{count}");

  return (
    <div className="band-head">
      <div className="band-title">
        <p className="kicker">{dictionary.results.bandKicker}</p>
        <h2>{artist.name}</h2>
        <ArtistTags tags={artist.tags} />
      </div>
      {/* Context, not headline: the audience size is worth knowing but it is
          not what was asked, so it reads as a meta line rather than a figure. */}
      {artist.listeners > 0 && (
        <p className="listeners">
          {listenersPrefix}
          <b>{formatNumber(artist.listeners, locale)}</b>
          {listenersSuffix}
        </p>
      )}
    </div>
  );
}
