import type { AlbumSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { deriveHue } from "@/lib/hue";
import { Artwork } from "@/components/Artwork";
import { CardShell } from "./CardShell";

interface AlbumCardProps {
  album: AlbumSummary | null;
}

/** The most-played album: artwork tile plus title and total plays. */
export function AlbumCard({ album }: AlbumCardProps) {
  if (!album) {
    return <CardShell label="Top album" note="No album available." />;
  }

  return (
    <div className="card">
      <div className="album">
        <Artwork imageUrl={album.imageUrl} hue={deriveHue(album.artistName)} alt={album.name} />
        <div className="album-info">
          <p className="label">Top album</p>
          <h3>
            <a href={album.url} target="_blank" rel="noopener noreferrer">
              {album.name}
            </a>
          </h3>
          <p className="plays">
            <b>{formatCount(album.playcount)}</b>
            <small>total plays</small>
          </p>
        </div>
      </div>
    </div>
  );
}
