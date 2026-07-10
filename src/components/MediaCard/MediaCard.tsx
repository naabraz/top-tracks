import { MediaCardContent } from "./MediaCardContent";

const CARD_CLASS =
  "group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[#d51007]/60 hover:bg-white/10";

interface MediaCardProps {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  url?: string;
  meta?: string;
  imageRounded?: boolean;
  onSelect?: (title: string) => void;
}

/**
 * A square-artwork card. With `onSelect` it renders a button that runs an
 * in-app action; otherwise it renders an external link to `url`.
 */
export function MediaCard({
  title,
  subtitle,
  imageUrl,
  url,
  meta,
  imageRounded = false,
  onSelect,
}: MediaCardProps) {
  function handleClick() {
    onSelect?.(title);
  }

  const content = (
    <MediaCardContent
      title={title}
      subtitle={subtitle}
      imageUrl={imageUrl}
      meta={meta}
      imageRounded={imageRounded}
    />
  );

  if (onSelect) {
    return (
      <button type="button" onClick={handleClick} className={`${CARD_CLASS} w-full text-left`}>
        {content}
      </button>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={CARD_CLASS}>
      {content}
    </a>
  );
}
