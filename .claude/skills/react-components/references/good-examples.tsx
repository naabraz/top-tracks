// GOOD EXAMPLES — components that follow the react-components conventions.
//
// Every example below is:
//   - a functional component (no classes)
//   - under 30 lines
//   - declared with a named function
//   - passing props explicitly (no spread operator)
// Custom hooks are prefixed with `use`.

import { FormEvent, useEffect, useState } from "react";

// ✅ Named functional component, explicit props, under 30 lines.
interface TrackCardProps {
  title: string;
  artist: string;
  onSelect: (title: string) => void;
}

export function TrackCard({ title, artist, onSelect }: TrackCardProps) {
  function handleClick() {
    onSelect(title);
  }

  return (
    <button type="button" onClick={handleClick} className="track-card">
      <span className="track-card__title">{title}</span>
      <span className="track-card__artist">{artist}</span>
    </button>
  );
}

// ✅ Named handler, controlled input, explicit props.
interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function SearchField({ value, onChange, onSubmit }: SearchFieldProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </form>
  );
}

// ✅ Custom hook: `use` prefix, encapsulates logic, returns a small API.
function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ✅ Composition: a big UI is split into small components, each passing props
// explicitly and each under 30 lines.
interface ArtistPanelProps {
  name: string;
  listeners: number;
  onOpen: (name: string) => void;
}

export function ArtistPanel({ name, listeners, onOpen }: ArtistPanelProps) {
  return (
    <section className="artist-panel">
      <ArtistHeader name={name} listeners={listeners} />
      <TrackCard title="Top track" artist={name} onSelect={onOpen} />
    </section>
  );
}

interface ArtistHeaderProps {
  name: string;
  listeners: number;
}

export function ArtistHeader({ name, listeners }: ArtistHeaderProps) {
  return (
    <header>
      <h2>{name}</h2>
      <p>{listeners.toLocaleString()} listeners</p>
    </header>
  );
}

export { useDebouncedValue };
