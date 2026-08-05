"use client";

import { ChangeEvent, FormEvent } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { SearchInput } from "./SearchInput";
import { SearchIcon } from "./SearchIcon";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchBar({ value, onChange, onSearch, isLoading }: SearchBarProps) {
  const { dictionary } = useTranslation();

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
        {isLoading ? dictionary.search.searching : dictionary.search.submit}
      </button>
    </form>
  );
}
