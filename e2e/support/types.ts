/** Types shared by the end-to-end helpers. */

import type { ArtistLookupErrorCode, ArtistLookupResult } from "@/lib/music/types";

/** Fixture lookups keyed by lowercase artist name, as the stub matches them. */
export type ArtistCatalog = Record<string, ArtistLookupResult>;

export interface MockArtistApiOptions {
  catalog: ArtistCatalog;
  /** Holds every response, so a test can assert what the reader sees mid-flight. */
  delayMs?: number;
}

export interface MockArtistApiErrorOptions {
  /** The stable code the route hands the client, mapped to copy in the UI. */
  code: ArtistLookupErrorCode;
  status?: number;
}
