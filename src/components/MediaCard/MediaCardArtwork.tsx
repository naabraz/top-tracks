import Image from "next/image";

interface MediaCardArtworkProps {
  imageUrl: string | null;
  alt: string;
  rounded: boolean;
}

/** Square artwork with a ♪ placeholder when no image is available. */
export function MediaCardArtwork({ imageUrl, alt, rounded }: MediaCardArtworkProps) {
  const shape = rounded ? "rounded-full" : "rounded-xl";

  return (
    <div className={`relative aspect-square w-full overflow-hidden bg-white/5 ${shape}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 640px) 40vw, 200px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/30">
          <span className="text-3xl">♪</span>
        </div>
      )}
    </div>
  );
}
