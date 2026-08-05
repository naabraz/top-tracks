"use client";

import type { AlbumSummary } from "@/lib/music/types";
import { formatCount } from "@/lib/format";
import { deriveHue } from "@/lib/hue";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Artwork } from "@/components/Artwork";
import { CardShell } from "./CardShell";

interface AlbumCardProps {
  album: AlbumSummary | null;
}

/** The most-played album: artwork tile plus title, release year, and plays. */
export function AlbumCard({ album }: AlbumCardProps) {
  const { dictionary, locale } = useTranslation();

  if (!album) {
    return (
      <CardShell label={dictionary.results.topAlbumLabel} note={dictionary.results.noAlbum} />
    );
  }

  return (
    <div className="card">
      <div className="album">
        <Artwork imageUrl={album.imageUrl} hue={deriveHue(album.artistName)} alt={album.name} />
        <div className="album-info">
          <p className="label">{dictionary.results.topAlbumLabel}</p>
          <h3>
            <a href={album.url} target="_blank" rel="noopener noreferrer">
              {album.name}
            </a>
          </h3>
          {/* Context for the record, not a figure to compare — so it reads as a
              quiet meta line rather than competing with the play total. */}
          {album.releaseYear !== null && (
            <p className="meta">
              {dictionary.results.released}{" "}
              <time dateTime={String(album.releaseYear)}>{album.releaseYear}</time>
            </p>
          )}
          <p className="plays">
            <b>{formatCount(album.playcount, locale)}</b>
            <small>{dictionary.results.totalPlays}</small>
          </p>
        </div>
      </div>
    </div>
  );
}
