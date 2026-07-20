# TopTracks

A responsive web app that lets you search for any artist or band and instantly
see their **most played track**, their **most played album**, and **three
similar artists**.

Built with the latest versions of Next.js (App Router), React, TypeScript,
Tailwind CSS, and Vitest.

## Data sources

- **[Last.fm API](https://www.last.fm/api)** — the source of truth for all data
  (top track, top album, similar artists). Its `artist.getTopTracks`,
  `artist.getTopAlbums`, and `artist.getSimilar` methods rank by play count and
  listeners, which is exactly the "most played" ranking the app needs.
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api)** —
  used **only for artwork**. Last.fm's artist images are placeholders and its
  track images are unreliable, so each entity (artist, top track, top album, each
  similar artist) is looked up on Spotify's search endpoint to fetch the correct
  image. The top track is searched as a track so it always gets **its own** album
  cover. This step is **best-effort**: if Spotify is unavailable the app falls
  back to a placeholder icon and keeps working.

> Spotify was the original single data source, but it restricts top-tracks,
> related-artists, and popularity data for apps created after its late-2024 policy
> change (they return `403 Forbidden`). Only its search/artwork endpoints remain
> usable for a new app, which is why data comes from Last.fm and Spotify is kept
> just for images.

## Features

- 🔍 **Artist search** — type a band or singer and get results in one click.
- 🎵 **Top track & album** — the artist's most played song and record.
- 👥 **Similar artists** — three artists with a comparable sound.
- 🖼️ **Correct artwork** — real artist photos and per-track album covers.
- 📱 **Responsive** — a single layout that works on both desktop and mobile.
- 🔒 **Server-side credentials** — all keys stay on the server; the browser only
  ever talks to this app's own `/api/artist` route.
- ✅ **Unit tested** — the Last.fm client, the lookup orchestration, the
  formatting helpers, and the search UI are covered by Vitest and Testing
  Library.

## Tech stack

| Concern      | Choice                                          |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)              |
| UI library   | React 19                                        |
| Language     | TypeScript                                      |
| Styling      | Tailwind CSS v4                                 |
| Testing      | Vitest + Testing Library                        |
| Data sources | Last.fm API (rankings and counts) + Spotify API (artwork, release year) |

## Getting started

### Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- A Last.fm API account (required)
- A Spotify developer app (optional — only enables artwork)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure API keys

1. Create a **Last.fm API account** at
   [last.fm/api/account/create](https://www.last.fm/api/account/create) to get an
   API key.
2. (Optional) Create a **Spotify app** at the
   [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) for a
   Client ID and Client Secret. Without these the app still works — it just shows
   placeholder icons instead of images.
3. Copy the example environment file and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   LASTFM_API_KEY=your-lastfm-api-key
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   ```

> **Note:** A `.env.local` with placeholder (dummy) values is included so the
> project builds out of the box. Searches will only return live data once the
> Last.fm key is real. `.env.local` is gitignored and must never be committed.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search for an artist.

## Available scripts

| Script               | Description                           |
| -------------------- | ------------------------------------- |
| `npm run dev`        | Start the development server.         |
| `npm run build`      | Create an optimized production build. |
| `npm run start`      | Serve the production build.           |
| `npm run lint`       | Run ESLint.                           |
| `npm test`           | Run the unit tests once.              |
| `npm run test:watch` | Run the unit tests in watch mode.     |

## Project structure

Files are **co-located**: everything a component owns (source, test, and
sub-components) lives in that component's own folder, and every source file has
its test right beside it (`Name.tsx` + `Name.test.tsx`, no `__tests__/`
folders). Screen-only building blocks live under the route in private
(`_`-prefixed) folders. These conventions are captured as skills in
`.claude/skills/`.

```
src/
├── app/
│   ├── api/artist/route.ts        # Server route: looks up an artist, returns JSON
│   ├── layout.tsx                 # Root layout, fonts, and metadata
│   ├── page.tsx                   # Home screen: composes the pieces below
│   ├── globals.css                # Tailwind entry point and base styles
│   ├── _hooks/                    # Screen-only hook (search request lifecycle)
│   │   └── useArtistSearch.ts
│   └── _components/               # Screen-only UI blocks
│       ├── PageHeader.tsx
│       ├── PageFooter.tsx
│       └── SearchStatus.tsx       # Loading / error / success states
├── components/                    # Reusable UI, one folder per component
│   ├── SearchBar/                 # Search form + SearchInput sub-component
│   ├── MediaCard/                 # Artwork card + MediaCardArtwork sub-component
│   └── ArtistResults/             # Result layout: header, sections, cards, grid
└── lib/
    ├── format.ts                  # Compact number formatting (plays, listeners)
    ├── music/
    │   ├── types.ts               # Domain models rendered by the UI
    │   └── lookup.ts              # Orchestrates Last.fm data + Spotify artwork
    ├── lastfm/
    │   ├── client.ts              # Typed Last.fm client (all data)
    │   └── types.ts               # Raw Last.fm response shapes
    └── spotify/
        ├── token.ts               # Client Credentials token fetching + caching
        ├── api.ts                 # Shared Spotify fetch helper
        ├── images.ts              # Best-effort artwork lookups
        └── types.ts               # Raw Spotify response shapes + token cache
```

## How it works

1. The browser calls the internal `/api/artist?q=<name>` route — every key stays
   on the server.
2. `lookupArtist` fetches the artist's info from Last.fm (and returns a clean 404
   if the artist does not exist).
3. It fetches the top track, top album, and similar artists from Last.fm in
   parallel.
4. For each entity it searches Spotify for the correct image in parallel — the
   top track is searched as a track so it gets its own album cover. This step
   never blocks or fails the response.
5. The combined result is returned as JSON and rendered into responsive cards.

## Testing

```bash
npm test
```

The suite covers:

- **`lib/format`** — compact number formatting.
- **`lib/lastfm/client`** — artist info, top track/album, similar artists, the
  not-found path, the placeholder-image filter, and error handling (with `fetch`
  mocked).
- **`lib/music/lookup`** — the orchestration and image enrichment, including a
  regression test that a top track gets its own artwork rather than the top
  album's (with Last.fm and Spotify mocked).
- **`app/_hooks/useArtistSearch`** — the search lifecycle: idle start, success,
  server-error, and connection-error paths (with `fetch` mocked).
- **UI components** — each component has a co-located test covering its rendered
  behavior: `SearchBar` (query submission, trimming, loading), `MediaCard`,
  `ArtistResults` and their sub-components, and the home-screen blocks
  (`PageHeader`, `PageFooter`, `SearchStatus`), all queried by role.

## License

This project is provided for educational purposes.
