import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistResults } from "@/components/ArtistResults";
import type { ArtistSearchStatus } from "../_hooks/useArtistSearch";

interface SearchStatusProps {
  status: ArtistSearchStatus;
  errorMessage: string | null;
  result: ArtistLookupResult | null;
  onSelectArtist: (name: string) => void;
}

/** Renders the loading, error, or success state of an artist search. */
export function SearchStatus({ status, errorMessage, result, onSelectArtist }: SearchStatusProps) {
  return (
    <div aria-live="polite">
      {status === "loading" && <p className="text-center text-white/60">Loading results…</p>}
      {status === "error" && errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
        >
          {errorMessage}
        </p>
      )}
      {status === "success" && result && (
        <ArtistResults result={result} onSelectArtist={onSelectArtist} />
      )}
    </div>
  );
}
