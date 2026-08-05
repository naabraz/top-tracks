"use client";

import type { RefObject } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";
import { ArtistResults } from "@/components/ArtistResults";
import { formatMessage } from "@/lib/i18n/formatMessage";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { ArtistSearchErrorCode, ArtistSearchStatus } from "../_hooks/useArtistSearch";
import { EmptyState } from "./EmptyState";
import { ResultsSkeleton } from "./ResultsSkeleton";

interface SearchStatusProps {
  status: ArtistSearchStatus;
  errorCode: ArtistSearchErrorCode | null;
  /** The searched query, interpolated into the not-found message. */
  query: string;
  result: ArtistLookupResult | null;
  onSelectArtist: (name: string) => void;
  resultRef?: RefObject<HTMLElement | null>;
}

/** Routes the search lifecycle to the empty, loading, error, or results view. */
export function SearchStatus({
  status,
  errorCode,
  query,
  result,
  onSelectArtist,
  resultRef,
}: SearchStatusProps) {
  const { dictionary } = useTranslation();
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
        {isLoading ? dictionary.search.searching : ""}
      </span>

      {status === "idle" && <EmptyState />}
      {isLoading && !result && <ResultsSkeleton />}
      {status === "error" && errorCode && (
        <p role="alert" className="notfound">
          {formatMessage(dictionary.errors[errorCode], { query })}
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
