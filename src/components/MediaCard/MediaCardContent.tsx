import { MediaCardArtwork } from "./MediaCardArtwork";

interface MediaCardContentProps {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  meta?: string;
  imageRounded: boolean;
}

/** The visual body of a card: artwork plus title, subtitle, and optional meta. */
export function MediaCardContent({
  title,
  subtitle,
  imageUrl,
  meta,
  imageRounded,
}: MediaCardContentProps) {
  return (
    <>
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
    </>
  );
}
