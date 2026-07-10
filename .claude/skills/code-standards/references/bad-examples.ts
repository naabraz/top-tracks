// BAD EXAMPLES — each block violates a code-standards rule. Do NOT copy these.
// Each is annotated with the rule it breaks and how to fix it. This file is a
// catalogue of anti-patterns; it is intentionally not meant to compile cleanly.

// ❌ RULE 1 — Non-English identifiers and comments.
// Fix: write everything in English (`function calculateTotal(price)`).
export function calcularTotal(preco: number) {
  // soma a taxa ao preco
  return preco * 1.1;
}

// ❌ RULE 2 — Body over 30 lines. Too much logic in one function.
// Fix: extract helpers (parse, validate, format) so each stays under 30 lines.
export function processArtist(raw: Record<string, string>) {
  const name = raw.name ?? "";
  const listeners = Number(raw.listeners ?? "0");
  const tagList = (raw.tags ?? "").split(",");
  const cleanedTags = [];
  for (const tag of tagList) {
    const trimmed = tag.trim();
    if (trimmed.length > 0) {
      cleanedTags.push(trimmed);
    }
  }
  const imageUrl = raw.image ?? "";
  const url = raw.url ?? "";
  const listenerLabel = listeners.toLocaleString();
  const header = `${name} (${listenerLabel})`;
  const footer = cleanedTags.join(", ");
  const summary = `${header} — ${footer}`;
  const isPopular = listeners > 1_000_000;
  const badge = isPopular ? "popular" : "rising";
  const finalLabel = `${summary} [${badge}]`;
  const hasImage = imageUrl.length > 0;
  const hasUrl = url.length > 0;
  const isComplete = hasImage && hasUrl;
  return { name, listeners, cleanedTags, finalLabel, isComplete };
}

// ❌ RULE 3 — More than three parameters.
// Fix: group into a single options object.
export function createTrack(
  name: string,
  artist: string,
  album: string,
  duration: number,
  imageUrl: string,
) {
  return { name, artist, album, duration, imageUrl };
}

// ❌ RULE 4 — Function name does not start with a verb.
// Fix: rename to a verb phrase, e.g. `formatArtistName`.
export function artistName(name: string) {
  return name.trim();
}

// ❌ RULE 5 — if/else nested more than two levels deep.
// Fix: use early returns / guard clauses to flatten.
export function pickLabel(status: string, hasData: boolean, isAdmin: boolean) {
  if (status === "success") {
    if (hasData) {
      if (isAdmin) {
        return "Admin results";
      }
    }
  }
  return "No results";
}

// ❌ RULE 6 — switch/case.
// Fix: replace with a lookup map or early returns.
export function labelForStatus(status: string) {
  switch (status) {
    case "idle":
      return "Ready";
    case "loading":
      return "Loading…";
    default:
      return "Unknown";
  }
}

// ❌ RULE 7 — Ambiguous, non-descriptive variable names.
// Fix: name values for what they hold (`response`, `parsed`, `firstItem`).
export function getFirst(a: string) {
  const d = fetch(a);
  const x = d.then((r) => r.json());
  return x;
}

// ❌ RULE 8 — A shared interface declared inside an implementation file.
// Fix: move Album to its own file or into a `types.ts` module.
export interface Album {
  name: string;
  artist: string;
}

export function renderAlbum(album: Album) {
  return `${album.name} by ${album.artist}`;
}
