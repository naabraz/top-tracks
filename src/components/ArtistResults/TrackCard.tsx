import type { TrackSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { deriveHue } from "@/lib/hue";
import { Artwork } from "@/components/Artwork";
import { CardShell } from "./CardShell";

/** The answer carries the larger cover; the album card keeps the default 150. */
const TRACK_ARTWORK_SIZE = 190;

interface TrackCardProps {
  track: TrackSummary | null;
}

/** The most-played track: the headline answer — cover, title, and play total. */
export function TrackCard({ track }: TrackCardProps) {
  if (!track) {
    return <CardShell label="Top track" note="No track available." />;
  }

  return (
    <div className="card">
      <div className="track">
        <Artwork
          imageUrl={track.imageUrl}
          hue={deriveHue(track.artistName)}
          alt={track.name}
          size={TRACK_ARTWORK_SIZE}
        />
        <div className="track-info">
          <p className="label">Top track</p>
          <h3>
            <a href={track.url} target="_blank" rel="noopener noreferrer">
              {track.name}
            </a>
          </h3>
          <p className="plays">
            <b>{formatCount(track.playcount)}</b>
            <small>plays</small>
          </p>
        </div>
      </div>
    </div>
  );
}
