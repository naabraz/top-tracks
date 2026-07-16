import type { ArtistSummary } from "@/lib/music/types";
import { formatNumber } from "@/lib/format";
import { ArtistTags } from "./ArtistTags";

interface ArtistHeaderProps {
  artist: ArtistSummary;
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  return (
    <div className="band-head">
      <div className="band-title">
        <p className="kicker">Band</p>
        <h2>{artist.name}</h2>
        <ArtistTags tags={artist.tags} />
      </div>
      {/* Context, not headline: the audience size is worth knowing but it is
          not what was asked, so it reads as a meta line rather than a figure. */}
      {artist.listeners > 0 && (
        <p className="listeners">
          <b>{formatNumber(artist.listeners)}</b> listeners on Last.fm
        </p>
      )}
    </div>
  );
}
