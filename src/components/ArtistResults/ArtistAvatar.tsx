import Image from "next/image";

interface ArtistAvatarProps {
  imageUrl: string | null;
  name: string;
}

/** Round artist portrait with a ♪ placeholder when no image is available. */
export function ArtistAvatar({ imageUrl, name }: ArtistAvatarProps) {
  return (
    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full bg-white/5 sm:h-32 sm:w-32">
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes="128px" className="object-cover" priority />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-4xl text-white/30">
          ♪
        </div>
      )}
    </div>
  );
}
