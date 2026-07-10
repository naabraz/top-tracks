/** The home screen title and tagline. */
export function PageHeader() {
  return (
    <div className="flex flex-col gap-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
        <span className="bg-gradient-to-r from-[#1db954] to-[#d51007] bg-clip-text text-transparent">
          TopTracks
        </span>
      </h1>
      <p className="mx-auto max-w-xl text-sm text-white/60 sm:text-base">
        Search for any artist or band to discover their most played track and album, plus three
        artists with a similar sound.
      </p>
    </div>
  );
}
