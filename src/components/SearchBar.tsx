"use client";

import { FormEvent, useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3 sm:flex-row"
      role="search"
    >
      <label htmlFor="artist-search" className="sr-only">
        Artist or band name
      </label>
      <input
        id="artist-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for an artist or band…"
        autoComplete="off"
        className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-[#d51007] focus:ring-2 focus:ring-[#d51007]/40"
      />
      <button
        type="submit"
        disabled={isLoading || value.trim().length === 0}
        className="rounded-full bg-[#d51007] px-6 py-3 font-semibold text-white transition hover:bg-[#b40d06] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
