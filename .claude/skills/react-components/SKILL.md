---
name: react-components
description: Conventions for authoring React components and hooks in the top-tracks project. Use whenever creating or editing a React component, hook, or .tsx file.
---

<critical>
Before applying these conventions or writing any React code, you MUST read every
file in the `references/` folder of this skill:

- `references/good-examples.tsx`
- `references/bad-examples.tsx`

These references define the exact patterns to follow and to avoid. Do not skip
them, even if the rules below seem self-explanatory.
</critical>

# React Component Conventions

Follow these rules whenever you create or edit a React component or hook in this
project. They are hard requirements, not suggestions.

## Rules

1. **Functional components only.** Never create class components. Every component
   is a function that returns JSX.
2. **Keep components under 30 lines.** If a component grows past 30 lines, extract
   part of its markup or logic into a smaller child component or a custom hook.
3. **Use named functions.** Declare components and handlers as named functions
   (`function ComponentName() {}` / `function handleClick() {}`), not anonymous
   arrow functions assigned to variables. This keeps stack traces and React
   DevTools readable.
4. **Prefix custom hooks with `use`.** Any custom hook must start with `use`
   (e.g. `useArtistSearch`) so React's rules of hooks and the linter apply.
5. **Pass props explicitly.** Always list each prop by name. Do not use the spread
   operator (`{...props}`) to forward props.

## Examples

### ✅ Do

```tsx
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
    <button type="button" onClick={handleClick}>
      {title} — {artist}
    </button>
  );
}
```

```tsx
function useArtistSearch(query: string) {
  const [result, setResult] = useState<ArtistLookupResult | null>(null);
  // ...fetch logic
  return result;
}
```

### ❌ Don't

```tsx
// ❌ class component
class TrackCard extends React.Component { /* ... */ }

// ❌ anonymous arrow function assigned to a component
const TrackCard = (props) => <button {...props} />; // ❌ spread operator

// ❌ hook without the `use` prefix
function artistSearch(query: string) { /* ... */ }
```

## When a component gets too big

Split it. A card that renders a header, a body, and a footer becomes three small
components composed together, each passing props explicitly and each under 30
lines.

## References

For fuller, annotated examples see the `references/` folder:

- [`references/good-examples.tsx`](references/good-examples.tsx) — components and
  a custom hook that follow every rule, including how to split a large component
  into small composed ones.
- [`references/bad-examples.tsx`](references/bad-examples.tsx) — a catalogue of
  anti-patterns, each annotated with the rule it breaks and how to fix it.
