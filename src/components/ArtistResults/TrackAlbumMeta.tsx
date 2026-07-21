interface TrackAlbumMetaProps {
  albumName: string | null;
  releaseYear: number | null;
}

/** The record carrying the top track: context for the answer, as a quiet meta
 * line — never a figure competing with the play total. */
export function TrackAlbumMeta({ albumName, releaseYear }: TrackAlbumMetaProps) {
  if (!albumName) {
    return null;
  }

  return (
    <p className="meta">
      From {albumName}
      {releaseYear !== null && (
        <>
          {" "}
          (<time dateTime={String(releaseYear)}>{releaseYear}</time>)
        </>
      )}
    </p>
  );
}
