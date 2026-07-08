import Image from "next/image";
import type { ArtistLookupResult } from "@/lib/spotify/types";
import { formatDuration, formatFollowers, formatReleaseYear } from "@/lib/format";
import { MediaCard } from "./MediaCard";

interface ArtistResultsProps {
  result: ArtistLookupResult;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">{children}</h2>
  );
}

export function ArtistResults({ result }: ArtistResultsProps) {
  const { artist, topTrack, topAlbum, similarArtists } = result;

  return (
    <section className="flex flex-col gap-10" aria-label={`Results for ${artist.name}`}>
      <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-32 sm:w-32">
          {artist.imageUrl ? (
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              sizes="128px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl text-white/30">
              ♪
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{artist.name}</h1>
          <p className="text-sm text-white/60">
            {formatFollowers(artist.followers)} followers
          </p>
          {artist.genres.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2 sm:justify-start">
              {artist.genres.slice(0, 3).map((genre) => (
                <li
                  key={genre}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70"
                >
                  {genre}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <SectionHeading>Most popular track</SectionHeading>
          {topTrack ? (
            <MediaCard
              title={topTrack.name}
              subtitle={topTrack.albumName}
              imageUrl={topTrack.imageUrl}
              spotifyUrl={topTrack.spotifyUrl}
              meta={`Duration ${formatDuration(topTrack.durationMs)}`}
            />
          ) : (
            <p className="text-sm text-white/50">No tracks available.</p>
          )}
        </div>

        <div>
          <SectionHeading>Most popular album</SectionHeading>
          {topAlbum ? (
            <MediaCard
              title={topAlbum.name}
              subtitle={formatReleaseYear(topAlbum.releaseDate)}
              imageUrl={topAlbum.imageUrl}
              spotifyUrl={topAlbum.spotifyUrl}
              meta={`${topAlbum.totalTracks} tracks`}
            />
          ) : (
            <p className="text-sm text-white/50">No albums available.</p>
          )}
        </div>
      </div>

      <div>
        <SectionHeading>Similar artists</SectionHeading>
        {similarArtists.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {similarArtists.map((similar) => (
              <MediaCard
                key={similar.id}
                title={similar.name}
                subtitle={`${formatFollowers(similar.followers)} followers`}
                imageUrl={similar.imageUrl}
                spotifyUrl={similar.spotifyUrl}
                imageRounded
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/50">No similar artists found.</p>
        )}
      </div>
    </section>
  );
}
