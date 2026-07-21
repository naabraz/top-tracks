/** Types shared by the end-to-end helpers. */

import type { ArtistLookupResult } from "@/lib/music/types";

/** Fixture lookups keyed by lowercase artist name, as the stub matches them. */
export type ArtistCatalog = Record<string, ArtistLookupResult>;

export interface MockArtistApiOptions {
  catalog: ArtistCatalog;
  /** Holds every response, so a test can assert what the reader sees mid-flight. */
  delayMs?: number;
}

export interface MockArtistApiErrorOptions {
  /** The message the route hands the client, shown verbatim to the reader. */
  message: string;
  status?: number;
}
