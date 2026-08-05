import { NextResponse } from "next/server";
import { lookupArtist } from "@/lib/music/lookup";
import { LastfmError } from "@/lib/lastfm/client";
import type { ArtistLookupErrorCode } from "@/lib/music/types";

function respondWithError(code: ArtistLookupErrorCode, status: number) {
  return NextResponse.json({ code }, { status });
}

function isMissingApiKey(error: LastfmError): boolean {
  return error.code === null && error.message.includes("LASTFM_API_KEY");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return respondWithError("missing-query", 400);
  }

  try {
    const result = await lookupArtist(query);

    if (!result) {
      return respondWithError("not-found", 404);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LastfmError) {
      return respondWithError(
        isMissingApiKey(error) ? "missing-api-key" : "upstream-error",
        502,
      );
    }

    return respondWithError("unexpected-error", 500);
  }
}
