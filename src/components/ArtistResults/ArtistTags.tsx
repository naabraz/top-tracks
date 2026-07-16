interface ArtistTagsProps {
  tags: string[];
}

/** The amber genre/tag pills under a band name. Renders nothing when empty. */
export function ArtistTags({ tags }: ArtistTagsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tags">
      {tags.map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
}
