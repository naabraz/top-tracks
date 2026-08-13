/**
 * The reader's trail of looked-up artists, mirrored in `localStorage`.
 *
 * A module-level store rather than component state: `useSyncExternalStore`
 * wants a `subscribe`/`getSnapshot` pair, and that pair is what lets the list
 * be correct in its very first client paint instead of popping in after an
 * effect. Nothing here ever leaves the device.
 */

const STORAGE_KEY = "top-tracks-recent-searches";
const MAX_ENTRIES = 10;

/** One shared reference, so an empty list never looks like a change. */
const EMPTY_SEARCHES: readonly string[] = Object.freeze([]);

const listeners = new Set<() => void>();

/**
 * The snapshot handed to React. It has to keep its identity between mutations:
 * a fresh array per call would loop `useSyncExternalStore` forever.
 */
let cachedSearches: readonly string[] | null = null;

function isSameArtist(one: string, other: string): boolean {
  return one.trim().toLowerCase() === other.trim().toLowerCase();
}

function hasSameEntries(one: readonly string[], other: readonly string[]): boolean {
  return one.length === other.length && one.every((entry, index) => entry === other[index]);
}

/** Storage can be blocked outright (private browsing), so reading may throw. */
function readStoredValue(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Stored data is user-controlled input: a hand-edited key can shorten the list
 * but must never break the screen. Anything unusable is dropped silently.
 */
function sanitizeSearches(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return EMPTY_SEARCHES;
  }

  const usableNames: string[] = [];
  for (const member of value) {
    if (usableNames.length === MAX_ENTRIES) break;
    if (typeof member !== "string") continue;
    const artistName = member.trim();
    if (!artistName) continue;
    if (usableNames.some((kept) => isSameArtist(kept, artistName))) continue;
    usableNames.push(artistName);
  }

  return usableNames.length === 0 ? EMPTY_SEARCHES : usableNames;
}

function readStoredSearches(): readonly string[] {
  const storedValue = readStoredValue();
  if (storedValue === null) {
    return EMPTY_SEARCHES;
  }

  try {
    return sanitizeSearches(JSON.parse(storedValue));
  } catch {
    return EMPTY_SEARCHES;
  }
}

/** A full disk or a blocked quota costs the reader nothing but next session. */
function persistSearches(searches: readonly string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // The in-memory snapshot still stands: the list behaves normally for the
    // rest of the session and is simply not there next time.
  }
}

function commitSearches(searches: readonly string[]): void {
  cachedSearches = searches;
  persistSearches(searches);
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): readonly string[] {
  cachedSearches ??= readStoredSearches();
  return cachedSearches;
}

/** On the server there is no device to read, so the trail is always empty. */
export function getServerSnapshot(): readonly string[] {
  return EMPTY_SEARCHES;
}

/**
 * Records an artist at the front of the trail. Doubles as the promote
 * operation: an artist already listed moves up instead of being duplicated.
 */
export function addSearch(artistName: string): void {
  const trimmedName = artistName.trim();
  if (!trimmedName) {
    return;
  }

  const currentSearches = getSnapshot();
  const nextSearches = [
    trimmedName,
    ...currentSearches.filter((entry) => !isSameArtist(entry, trimmedName)),
  ].slice(0, MAX_ENTRIES);

  // Re-adding what is already first changes nothing; notifying would only
  // cost a render.
  if (hasSameEntries(currentSearches, nextSearches)) {
    return;
  }
  commitSearches(nextSearches);
}

export function removeSearch(artistName: string): void {
  const currentSearches = getSnapshot();
  const nextSearches = currentSearches.filter((entry) => !isSameArtist(entry, artistName));

  if (nextSearches.length === currentSearches.length) {
    return;
  }
  commitSearches(nextSearches);
}
