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
      {artist.listeners > 0 && (
        <div className="listeners">
          <div className="n">{formatNumber(artist.listeners)}</div>
          <div className="l">
            <span className="dot">●</span> listeners on Last.fm
          </div>
        </div>
      )}
    </div>
  );
}
