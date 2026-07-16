import type { RefObject } from "react";
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
  resultRef?: RefObject<HTMLElement | null>;
}

/** Routes the search lifecycle to the empty, loading, error, or results view. */
export function SearchStatus({
  status,
  errorMessage,
  result,
  onSelectArtist,
  resultRef,
}: SearchStatusProps) {
  const isLoading = status === "loading";
  // Once an answer is on screen it stays there, dimmed, while the next one
  // loads. The skeleton is for the first search only, when there is nothing
  // to hold the reader's place.
  const showResult = result !== null && (status === "success" || isLoading);

  return (
    <>
      {/* Deliberately scoped to a short status line: the results sit outside
          the live region because focus landing on them already announces the
          new artist, and announcing the whole subtree would say it twice. */}
      <span className="sr-only" aria-live="polite">
        {isLoading ? "Searching…" : ""}
      </span>

      {status === "idle" && <EmptyState />}
      {isLoading && !result && <ResultsSkeleton />}
      {status === "error" && errorMessage && (
        <p role="alert" className="notfound">
          {errorMessage}
        </p>
      )}
      {showResult && result && (
        <ArtistResults
          result={result}
          onSelectArtist={onSelectArtist}
          sectionRef={resultRef}
          isStale={isLoading}
        />
      )}
    </>
  );
}
