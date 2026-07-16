import type { TrackSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { Waveform } from "./Waveform";
import { CardShell } from "./CardShell";

interface TrackCardProps {
  track: TrackSummary | null;
}

/** The most-played track: title, decorative waveform, and play total. */
export function TrackCard({ track }: TrackCardProps) {
  if (!track) {
    return <CardShell label="Top track" note="No track available." />;
  }

  return (
    <div className="card">
      <div className="track">
        <p className="label">Top track</p>
        <h3>
          <a href={track.url} target="_blank" rel="noopener noreferrer">
            {track.name}
          </a>
        </h3>
        <Waveform seed={track.name.length} />
        <div className="foot">
          <b>{formatCount(track.playcount)}</b>
          <small>plays</small>
        </div>
      </div>
    </div>
  );
}
