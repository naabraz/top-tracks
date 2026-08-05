// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { lookupArtist } from "@/lib/music/lookup";
import { LastfmError } from "@/lib/lastfm/client";
import type { ArtistLookupResult } from "@/lib/music/types";

vi.mock("@/lib/music/lookup", () => ({
  lookupArtist: vi.fn(),
}));

const lookupArtistMock = vi.mocked(lookupArtist);

function buildRequest(query?: string): Request {
  const url = new URL("http://localhost:3000/api/artist");
  if (query !== undefined) {
    url.searchParams.set("q", query);
  }
  return new Request(url);
}

afterEach(() => {
  lookupArtistMock.mockReset();
});

describe("GET /api/artist", () => {
  it("responds 400 with the missing-query code when q is absent", async () => {
    const response = await GET(buildRequest());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ code: "missing-query" });
  });

  it("responds 404 with the not-found code for an unmatched artist", async () => {
    lookupArtistMock.mockResolvedValue(null);

    const response = await GET(buildRequest("nobody"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ code: "not-found" });
  });

  it("responds 502 with the missing-api-key code when the key is not configured", async () => {
    lookupArtistMock.mockRejectedValue(
      new LastfmError("Missing LASTFM_API_KEY environment variable.", null),
    );

    const response = await GET(buildRequest("Opeth"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "missing-api-key" });
  });

  it("responds 502 with the upstream-error code when Last.fm fails", async () => {
    lookupArtistMock.mockRejectedValue(
      new LastfmError("Operation failed - Something went wrong", 8),
    );

    const response = await GET(buildRequest("Opeth"));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ code: "upstream-error" });
  });

  it("responds 500 with the unexpected-error code for an unknown failure", async () => {
    lookupArtistMock.mockRejectedValue(new Error("boom"));

    const response = await GET(buildRequest("Opeth"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "unexpected-error" });
  });

  it("responds 200 with the lookup result unchanged on success", async () => {
    const result = {
      artist: { name: "Opeth", listeners: 1_000, tags: [], imageUrl: null, url: "" },
      topTrack: null,
      topAlbum: null,
      similarArtists: [],
    } satisfies ArtistLookupResult;
    lookupArtistMock.mockResolvedValue(result);

    const response = await GET(buildRequest("Opeth"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
  });
});
