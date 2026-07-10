import type { AlbumSummary, TrackSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { MediaCard } from "@/components/MediaCard";

interface PlayCountCardProps {
  item: TrackSummary | AlbumSummary;
}

/** A MediaCard for a track or album, showing its play count as the meta line. */
export function PlayCountCard({ item }: PlayCountCardProps) {
  return (
    <MediaCard
      title={item.name}
      subtitle={item.artistName}
      imageUrl={item.imageUrl}
      url={item.url}
      meta={`${formatCount(item.playcount)} plays`}
    />
  );
}
