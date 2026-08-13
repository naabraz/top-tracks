"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";
import {
  addSearch,
  getServerSnapshot,
  getSnapshot,
  removeSearch,
  subscribe,
} from "./recentSearchesStore";
import type { ArtistSearchStatus } from "./useArtistSearch";

interface RecentSearches {
  entries: readonly string[];
  /** Arms (or disarms) the recording of the navigation about to happen. */
  markTyped: (isTyped: boolean) => void;
  openEntry: (artistName: string) => void;
  removeEntry: (artistName: string) => void;
}

/**
 * Binds the recent-searches store to one search screen.
 *
 * Recording happens on the settled answer, because that is where the canonical
 * artist name lives — but only the search form arms it. A mark set at
 * navigation time and consumed on the next settle is what keeps a shared link,
 * a back step, or a similar-artist hop out of the reader's own trail.
 */
export function useRecentSearches(
  status: ArtistSearchStatus,
  result: ArtistLookupResult | null,
): RecentSearches {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const typedPendingRef = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!typedPendingRef.current) return;

    // Consumed whatever the outcome: a search that failed must not be recorded
    // by the next lookup that happens to succeed.
    typedPendingRef.current = false;

    if (status !== "success" || !result) return;
    addSearch(result.artist.name);
  }, [status, result]);

  function markTyped(isTyped: boolean) {
    typedPendingRef.current = isTyped;
  }

  function openEntry(artistName: string) {
    // A click landing mid-flight of a typed search must not steal its
    // recording, so the mark goes before the promotion.
    typedPendingRef.current = false;
    addSearch(artistName);
  }

  function removeEntry(artistName: string) {
    removeSearch(artistName);
  }

  return { entries, markTyped, openEntry, removeEntry };
}
