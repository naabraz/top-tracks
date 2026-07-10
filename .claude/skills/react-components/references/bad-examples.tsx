// BAD EXAMPLES — each block violates a react-components rule. Do NOT copy these.
// Each is annotated with the rule it breaks and how to fix it. This file is a
// catalogue of anti-patterns; it is intentionally not meant to compile cleanly.

import React, { FormEvent, useEffect, useState } from "react";

// ❌ RULE 1 — Class component. Components must be functional.
// Fix: rewrite as `function TrackCard(props) { return ...; }`.
export class TrackCard extends React.Component<{ title: string }> {
  render() {
    return <button>{this.props.title}</button>;
  }
}

// ❌ RULE 2 — Component over 30 lines. Too much markup/logic in one component.
// Fix: extract ArtistHeader, TrackList, and SimilarArtists child components.
interface ArtistPageProps {
  name: string;
  listeners: number;
  tracks: string[];
  albums: string[];
  similar: string[];
}

export function ArtistPage({
  name,
  listeners,
  tracks,
  albums,
  similar,
}: ArtistPageProps) {
  return (
    <main>
      <header>
        <h1>{name}</h1>
        <p>{listeners} listeners</p>
      </header>
      <section>
        <h2>Tracks</h2>
        <ul>
          {tracks.map((track) => (
            <li key={track}>{track}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Albums</h2>
        <ul>
          {albums.map((album) => (
            <li key={album}>{album}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Similar artists</h2>
        <ul>
          {similar.map((artist) => (
            <li key={artist}>{artist}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// ❌ RULE 3 — Anonymous arrow function assigned to a variable.
// Fix: `export function SearchField(props: SearchFieldProps) { ... }`.
export const SearchField = (props: { value: string }) => {
  return <input value={props.value} />;
};

// ❌ RULE 3 — Inline anonymous handler with real logic inside JSX.
// Fix: extract a named `handleSubmit` function.
export function LoginForm() {
  return (
    <form
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // ...lots of submit logic crammed inline
      }}
    />
  );
}

// ❌ RULE 4 — Custom hook without the `use` prefix.
// Fix: rename to `useDebouncedValue` so the rules of hooks apply.
function debouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ❌ RULE 5 — Spread operator used to forward props.
// Fix: list each prop explicitly: `<button type={type} onClick={onClick}>`.
interface IconButtonProps {
  type: "button" | "submit";
  onClick: () => void;
  label: string;
}

export function IconButton(props: IconButtonProps) {
  return <button {...props}>{props.label}</button>;
}

export { debouncedValue };
