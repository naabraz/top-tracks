import { useEffect, useState } from "react";
import type { ArtistLookupErrorCode, ArtistLookupResult } from "@/lib/music/types";

export type ArtistSearchStatus = "idle" | "loading" | "success" | "error";

/** The API's stable codes plus the one failure only the client can see. */
export type ArtistSearchErrorCode = ArtistLookupErrorCode | "network-error";

interface ArtistSearch {
  status: ArtistSearchStatus;
  result: ArtistLookupResult | null;
  errorCode: ArtistSearchErrorCode | null;
}

/** The outcome of the last lookup that finished, tagged with what it answered. */
interface Settled {
  query: string;
  result: ArtistLookupResult | null;
  errorCode: ArtistSearchErrorCode | null;
}

const IDLE: ArtistSearch = { status: "idle", result: null, errorCode: null };

const API_ERROR_CODES: readonly ArtistLookupErrorCode[] = [
  "missing-query",
  "not-found",
  "missing-api-key",
  "upstream-error",
  "unexpected-error",
];

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function parseErrorCode(body: unknown): ArtistSearchErrorCode {
  if (body === null || typeof body !== "object" || !("code" in body)) {
    return "unexpected-error";
  }
  const code = (body as { code: unknown }).code;
  if (typeof code === "string" && (API_ERROR_CODES as readonly string[]).includes(code)) {
    return code as ArtistLookupErrorCode;
  }
  return "unexpected-error";
}

/**
 * Looks up `query` and owns the request lifecycle for the home screen.
 *
 * The query is the source of truth: callers move the URL and this hook
 * follows, so back and forward replay the discovery path for free.
 *
 * Only the finished lookup is stored; idle and loading are derived by asking
 * whether what settled still answers the query being asked. That keeps the
 * previous artist on screen while the next one loads, so the page holds its
 * height instead of collapsing under the reader mid-loop.
 *
 * Failures surface as stable codes, never prose: the API's own codes pass
 * through, a body without a recognizable code becomes `unexpected-error`,
 * and a failed fetch becomes `network-error`.
 */
export function useArtistSearch(query: string): ArtistSearch {
  const [settled, setSettled] = useState<Settled | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;

    // Guards a fast second tap: a response arriving after the query moved on
    // is dropped instead of overwriting the newer artist.
    let active = true;

    async function lookup() {
      try {
        const response = await fetch(`/api/artist?q=${encodeURIComponent(trimmed)}`);
        const body = await readBody(response);
        if (!active) return;

        if (response.ok && body !== null) {
          setSettled({ query: trimmed, result: body as ArtistLookupResult, errorCode: null });
          return;
        }
        setSettled({ query: trimmed, result: null, errorCode: parseErrorCode(body) });
      } catch {
        if (!active) return;
        setSettled({ query: trimmed, result: null, errorCode: "network-error" });
      }
    }

    lookup();

    return () => {
      active = false;
    };
  }, [trimmed]);

  if (!trimmed) return IDLE;

  if (settled?.query !== trimmed) {
    // Still in flight. Hold onto the outgoing artist, if there is one.
    return { status: "loading", result: settled?.result ?? null, errorCode: null };
  }

  if (settled.errorCode) {
    return { status: "error", result: null, errorCode: settled.errorCode };
  }

  return { status: "success", result: settled.result, errorCode: null };
}
