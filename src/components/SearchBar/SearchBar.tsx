"use client";

import { ChangeEvent, FormEvent } from "react";
import { SearchInput } from "./SearchInput";
import { SearchIcon } from "./SearchIcon";

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
    <form onSubmit={handleSubmit} className="search" role="search" autoComplete="off">
      <SearchIcon />
      <SearchInput value={value} onChange={handleChange} />
      <button type="submit" disabled={isLoading || value.trim().length === 0}>
        {isLoading ? "Searching…" : "Discover"}
      </button>
    </form>
  );
}
