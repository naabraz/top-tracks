import Image from "next/image";
import type { CSSProperties } from "react";

interface ArtworkProps {
  imageUrl: string | null;
  hue: number;
  alt: string;
}

/**
 * Album artwork tile. Shows the real cover when one is available, otherwise a
 * hue-tinted CSS placeholder (layered gradients + forest silhouette + grain).
 */
export function Artwork({ imageUrl, hue, alt }: ArtworkProps) {
  const style = { "--hue": hue } as CSSProperties;

  return (
    <div className={`artwork${imageUrl ? " has-image" : ""}`} style={style}>
      {imageUrl && <Image src={imageUrl} alt={alt} fill sizes="170px" />}
    </div>
  );
}
