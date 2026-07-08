"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ArtistResults } from "@/components/ArtistResults";
import type { ArtistLookupResult } from "@/lib/spotify/types";

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ArtistLookupResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSearch(query: string) {
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          Top<span className="text-emerald-400">Tracks</span>
        </h1>
        <p className="mx-auto max-w-xl text-sm text-white/60 sm:text-base">
          Search for any artist or band to discover their most popular track and
          album, plus three artists with a similar sound.
        </p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={status === "loading"} />

      <div aria-live="polite">
        {status === "loading" && (
          <p className="text-center text-white/60">Loading results…</p>
        )}

        {status === "error" && errorMessage && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300"
          >
            {errorMessage}
          </p>
        )}

        {status === "success" && result && <ArtistResults result={result} />}
      </div>
    </main>
  );
}
