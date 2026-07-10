"use client";

import { ChangeEvent, FormEvent } from "react";
import { SearchInput } from "./SearchInput";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ value, onChange, onSearch, isLoading }: SearchBarProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row" role="search">
      <SearchInput value={value} onChange={handleChange} />
      <button
        type="submit"
        disabled={isLoading || value.trim().length === 0}
        className="rounded-full bg-gradient-to-r from-[#1db954] to-[#d51007] px-6 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
      >
        {isLoading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
