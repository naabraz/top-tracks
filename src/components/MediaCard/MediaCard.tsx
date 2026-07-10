import { MediaCardArtwork } from "./MediaCardArtwork";

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
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[#d51007]/60 hover:bg-white/10"
    >
      <MediaCardArtwork imageUrl={imageUrl} alt={title} rounded={imageRounded} />
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
