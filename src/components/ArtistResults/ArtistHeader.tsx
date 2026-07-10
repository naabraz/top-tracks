import type { ArtistSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { ArtistAvatar } from "./ArtistAvatar";

interface ArtistHeaderProps {
  artist: ArtistSummary;
}

export function ArtistHeader({ artist }: ArtistHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
      <ArtistAvatar imageUrl={artist.imageUrl} name={artist.name} />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white sm:text-4xl">{artist.name}</h1>
        {artist.listeners > 0 && (
          <p className="text-sm text-white/60">{formatCount(artist.listeners)} listeners</p>
        )}
        {artist.tags.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {artist.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
