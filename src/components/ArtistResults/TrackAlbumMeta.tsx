"use client";

import { formatMessage } from "@/lib/i18n/formatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TrackAlbumMetaProps {
  albumName: string | null;
  releaseYear: number | null;
}

/** The record carrying the top track: context for the answer, as a quiet meta
 * line — never a figure competing with the play total. */
export function TrackAlbumMeta({ albumName, releaseYear }: TrackAlbumMetaProps) {
  const { dictionary } = useTranslation();

  if (!albumName) {
    return null;
  }

  return (
    <p className="meta">
      {formatMessage(dictionary.results.fromAlbum, { album: albumName })}
      {releaseYear !== null && (
        <>
          {" "}
          (<time dateTime={String(releaseYear)}>{releaseYear}</time>)
        </>
      )}
    </p>
  );
}
