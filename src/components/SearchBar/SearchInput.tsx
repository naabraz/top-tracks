import { ChangeEvent } from "react";

interface SearchInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <>
      <label htmlFor="artist-search" className="sr-only">
        Artist or band name
      </label>
      <input
        id="artist-search"
        type="search"
        value={value}
        onChange={onChange}
        placeholder="Search for an artist or band…"
        autoComplete="off"
        className="flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-base text-white placeholder:text-white/40 outline-none transition focus:border-[#1db954] focus:ring-2 focus:ring-[#1db954]/40"
      />
    </>
  );
}
