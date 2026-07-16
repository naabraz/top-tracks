"use client";

import { useState } from "react";
import { SiteHeader } from "./_components/SiteHeader";
import { HeroSection } from "./_components/HeroSection";
import { PageFooter } from "./_components/PageFooter";
import { SearchStatus } from "./_components/SearchStatus";
import { useArtistSearch } from "./_hooks/useArtistSearch";

export default function Home() {
  const { status, result, errorMessage, search } = useArtistSearch();
  const [query, setQuery] = useState("");

  function handleSelectArtist(name: string) {
    setQuery(name);
    search(name);
  }

  return (
    <>
      <SiteHeader />
      <HeroSection
        value={query}
        onChange={setQuery}
        onSearch={search}
        isLoading={status === "loading"}
      />
      <main className="wrap">
        <SearchStatus
          status={status}
          errorMessage={errorMessage}
          result={result}
          onSelectArtist={handleSelectArtist}
        />
      </main>
      <PageFooter />
    </>
  );
}
