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
        placeholder="Try: Opeth, Tool, Pink Floyd…"
        autoComplete="off"
      />
    </>
  );
}
