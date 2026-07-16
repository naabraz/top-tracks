import type { CSSProperties } from "react";
import Image from "next/image";
import type { SimilarArtist } from "@/lib/music/types";
import { deriveHue } from "@/lib/hue";

interface SimilarArtistCardProps {
  artist: SimilarArtist;
  onSelect: (name: string) => void;
}

/** One clickable similar-artist tile: cover or monogram, name, and caption. */
export function SimilarArtistCard({ artist, onSelect }: SimilarArtistCardProps) {
  const style = { "--hue": deriveHue(artist.name) } as CSSProperties;

  function handleClick() {
    onSelect(artist.name);
  }

  return (
    <button type="button" className="sim" onClick={handleClick}>
      <span className="art" style={style}>
        {artist.imageUrl ? (
          <Image src={artist.imageUrl} alt="" fill sizes="56px" />
        ) : (
          artist.name.charAt(0)
        )}
      </span>
      <span className="info">
        <b>{artist.name}</b>
        <span>similar artist</span>
      </span>
    </button>
  );
}
