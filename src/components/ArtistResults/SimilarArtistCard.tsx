"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import type { SimilarArtist } from "@/lib/music/types";
import { deriveHue } from "@/lib/hue";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SimilarArtistCardProps {
  artist: SimilarArtist;
  onSelect: (name: string) => void;
}

/** One clickable similar-artist tile: cover or monogram, name, and caption. */
export function SimilarArtistCard({ artist, onSelect }: SimilarArtistCardProps) {
  const { dictionary } = useTranslation();
  const style = { "--hue": deriveHue(artist.name) } as CSSProperties;

  function handleClick() {
    onSelect(artist.name);
  }

  return (
    <button
      type="button"
      className="sim"
      onClick={handleClick}
      aria-label={formatMessage(dictionary.results.searchArtistLabel, { artist: artist.name })}
    >
      {/* Hidden from the accessible name: the monogram is a picture of the
          initial, and "P Portishead similar artist" is not a button label. */}
      <span className="art" style={style} aria-hidden="true">
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt="" fill sizes="56px" />
        ) : (
          artist.name.charAt(0)
        )}
      </span>
      <span className="info">
        <b>{artist.name}</b>
        <span>{dictionary.results.similarArtistCaption}</span>
      </span>
    </button>
  );
}
