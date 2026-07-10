"use client";

import { SearchBar } from "@/components/SearchBar";
import { PageHeader } from "./_components/PageHeader";
import { PageFooter } from "./_components/PageFooter";
import { SearchStatus } from "./_components/SearchStatus";
import { useArtistSearch } from "./_hooks/useArtistSearch";

export default function Home() {
  const { status, result, errorMessage, search } = useArtistSearch();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <PageHeader />
      <SearchBar onSearch={search} isLoading={status === "loading"} />
      <SearchStatus status={status} errorMessage={errorMessage} result={result} />
      <PageFooter />
    </main>
  );
}
