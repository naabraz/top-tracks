import { useEffect, useState } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";

export type ArtistSearchStatus = "idle" | "loading" | "success" | "error";

interface ArtistSearch {
  status: ArtistSearchStatus;
  result: ArtistLookupResult | null;
  errorMessage: string | null;
}

/** The outcome of the last lookup that finished, tagged with what it answered. */
interface Settled {
  query: string;
  result: ArtistLookupResult | null;
  errorMessage: string | null;
}

const IDLE: ArtistSearch = { status: "idle", result: null, errorMessage: null };

/**
 * Looks up `query` and owns the request lifecycle for the home screen.
 *
 * The query is the source of truth: callers move the URL and this hook
 * follows, so back and forward replay the discovery path for free.
 *
 * Only the finished lookup is stored; idle and loading are derived by asking
 * whether what settled still answers the query being asked. That keeps the
 * previous artist on screen while the next one loads, so the page holds its
 * height instead of collapsing under the reader mid-loop.
 */
export function useArtistSearch(query: string): ArtistSearch {
  const [settled, setSettled] = useState<Settled | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;

    // Guards a fast second tap: a response arriving after the query moved on
    // is dropped instead of overwriting the newer artist.
    let active = true;

    async function lookup() {
      try {
        const response = await fetch(`/api/artist?q=${encodeURIComponent(trimmed)}`);
        const data = await response.json();
        if (!active) return;

        setSettled({
          query: trimmed,
          result: response.ok ? (data as ArtistLookupResult) : null,
          errorMessage: response.ok
            ? null
            : (data.error ?? "Something went wrong. Please try again."),
        });
      } catch {
        if (!active) return;
        setSettled({
          query: trimmed,
          result: null,
          errorMessage: "Could not reach the server. Please check your connection.",
        });
      }
    }

    lookup();

    return () => {
      active = false;
    };
  }, [trimmed]);

  if (!trimmed) return IDLE;

  if (settled?.query !== trimmed) {
    // Still in flight. Hold onto the outgoing artist, if there is one.
    return { status: "loading", result: settled?.result ?? null, errorMessage: null };
  }

  if (settled.errorMessage) {
    return { status: "error", result: null, errorMessage: settled.errorMessage };
  }

  return { status: "success", result: settled.result, errorMessage: null };
}
