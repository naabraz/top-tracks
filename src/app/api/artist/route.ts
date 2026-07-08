import { NextResponse } from "next/server";
import { lookupArtist } from "@/lib/spotify/client";
import { SpotifyApiError } from "@/lib/spotify/client";
import { SpotifyAuthError } from "@/lib/spotify/token";

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
    if (error instanceof SpotifyAuthError) {
      return NextResponse.json(
        { error: "Spotify authentication failed. Check the server credentials." },
        { status: 502 }
      );
    }

    if (error instanceof SpotifyApiError) {
      return NextResponse.json(
        { error: "The Spotify API returned an error. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while contacting Spotify." },
      { status: 500 }
    );
  }
}
