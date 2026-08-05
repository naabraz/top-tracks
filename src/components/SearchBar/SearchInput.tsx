"use client";

import { ChangeEvent } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SearchInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  const { dictionary } = useTranslation();

  return (
    <>
      <label htmlFor="artist-search" className="sr-only">
        {dictionary.search.inputLabel}
      </label>
      <input
        id="artist-search"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={dictionary.search.placeholder}
        autoComplete="off"
      />
    </>
  );
}
