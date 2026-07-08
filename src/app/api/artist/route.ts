import { NextResponse } from "next/server";
import { lookupArtist } from "@/lib/music/lookup";
import { LastfmError } from "@/lib/lastfm/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Please provide an artist name using the `q` query parameter." },
      { status: 400 }
    );
  }

  try {
    const result = await lookupArtist(query);

    if (!result) {
      return NextResponse.json(
        { error: `No artist found matching "${query}".` },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LastfmError) {
      const missingKey = error.code === null && error.message.includes("LASTFM_API_KEY");
      return NextResponse.json(
        {
          error: missingKey
            ? "The server is missing its Last.fm API key."
            : "The Last.fm API returned an error. Please try again later.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while looking up the artist." },
      { status: 500 }
    );
  }
}
