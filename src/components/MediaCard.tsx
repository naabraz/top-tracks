import Image from "next/image";

interface MediaCardProps {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  url: string;
  meta?: string;
  imageRounded?: boolean;
}

/** A square-artwork card used for tracks, albums, and similar artists. */
export function MediaCard({
  title,
  subtitle,
  imageUrl,
  url,
  meta,
  imageRounded = false,
}: MediaCardProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/50 hover:bg-white/10"
    >
      <div
        className={`relative aspect-square w-full overflow-hidden bg-white/5 ${
          imageRounded ? "rounded-full" : "rounded-xl"
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
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
      <div className="flex flex-col gap-0.5">
        <p className="truncate font-semibold text-white" title={title}>
          {title}
        </p>
        <p className="truncate text-sm text-white/60" title={subtitle}>
          {subtitle}
        </p>
        {meta && <p className="mt-1 text-xs text-white/40">{meta}</p>}
      </div>
    </a>
  );
}
