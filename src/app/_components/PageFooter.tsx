/** Footer crediting the two data sources. */
export function PageFooter() {
  return (
    <footer className="mt-auto pt-6 text-center text-xs text-white/40">
      Data from{" "}
      <a
        href="https://www.last.fm"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#d51007] hover:underline"
      >
        Last.fm
      </a>{" "}
      · Artwork from{" "}
      <a
        href="https://www.spotify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-[#1db954] hover:underline"
      >
        Spotify
      </a>
    </footer>
  );
}
