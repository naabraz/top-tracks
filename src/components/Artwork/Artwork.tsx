import Image from "next/image";
import type { CSSProperties } from "react";

/** Every artwork grows to this edge length on phones, whatever its size prop. */
const MOBILE_SIZE = 170;

interface ArtworkProps {
  imageUrl: string | null;
  hue: number;
  alt: string;
  /** Rendered edge length in px. Drives the box and the `sizes` hint together. */
  size?: number;
}

/**
 * Album artwork tile. Shows the real cover when one is available, otherwise a
 * hue-tinted CSS placeholder (layered gradients + forest silhouette + grain).
 */
export function Artwork({ imageUrl, hue, alt, size = 150 }: ArtworkProps) {
  const style = { "--hue": hue, "--artwork-size": `${size}px` } as CSSProperties;

  return (
    <div className={`artwork${imageUrl ? " has-image" : ""}`} style={style}>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={`(max-width: 560px) ${MOBILE_SIZE}px, ${size}px`}
        />
      )}
    </div>
  );
}
