import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistResults } from "@/components/ArtistResults";
import type { ArtistSearchStatus } from "../_hooks/useArtistSearch";
import { EmptyState } from "./EmptyState";
import { ResultsSkeleton } from "./ResultsSkeleton";

interface SearchStatusProps {
  status: ArtistSearchStatus;
  errorMessage: string | null;
  result: ArtistLookupResult | null;
  onSelectArtist: (name: string) => void;
}

/** Routes the search lifecycle to the empty, loading, error, or results view. */
export function SearchStatus({ status, errorMessage, result, onSelectArtist }: SearchStatusProps) {
  return (
    <div aria-live="polite">
      {status === "idle" && <EmptyState />}
      {status === "loading" && <ResultsSkeleton />}
      {status === "error" && errorMessage && (
        <p role="alert" className="notfound">
          {errorMessage}
        </p>
      )}
      {status === "success" && result && (
        <ArtistResults result={result} onSelectArtist={onSelectArtist} />
      )}
    </div>
  );
}
