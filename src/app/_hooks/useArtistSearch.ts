import { useState } from "react";
import type { ArtistLookupResult } from "@/lib/music/types";

export type ArtistSearchStatus = "idle" | "loading" | "success" | "error";

interface ArtistSearch {
  status: ArtistSearchStatus;
  result: ArtistLookupResult | null;
  errorMessage: string | null;
  search: (query: string) => Promise<void>;
}

/** Owns the artist-search request lifecycle for the home screen. */
export function useArtistSearch(): ArtistSearch {
  const [status, setStatus] = useState<ArtistSearchStatus>("idle");
  const [result, setResult] = useState<ArtistLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function search(query: string) {
    setStatus("loading");
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/artist?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) {
        setResult(null);
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as ArtistLookupResult);
      setStatus("success");
    } catch {
      setResult(null);
      setStatus("error");
      setErrorMessage("Could not reach the server. Please check your connection.");
    }
  }

  return { status, result, errorMessage, search };
}
