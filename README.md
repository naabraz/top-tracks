# TopTracks

A responsive web app that lets you search for any artist or band and instantly
see their **most played track**, their **most played album**, and **three
similar artists**.

Built with the latest versions of Next.js (App Router), React, TypeScript,
Tailwind CSS, and Vitest.

## Why two APIs?

The app was originally designed around the [Spotify Web API](https://developer.spotify.com/documentation/web-api)
alone. However, Spotify has restricted several endpoints and fields for apps
created after its late-2024 policy change: for a new app, the **top-tracks**,
**related-artists**, and album **popularity** data all return `403 Forbidden` or
are stripped from responses under the Client Credentials flow.

Because of that, the data comes from two sources:

- **[Last.fm API](https://www.last.fm/api)** — powers the three core features.
  Its `artist.getTopTracks`, `artist.getTopAlbums`, and `artist.getSimilar`
  methods rank by play count and listeners, which is exactly the "most played"
  ranking the app needs.
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api)** —
  used only to enrich results with high-quality artist and album artwork, since
  Spotify's search endpoint still returns images. This part is **best-effort**:
  if Spotify is unavailable, the app falls back to Last.fm images or a
  placeholder and keeps working.

## Features

- 🔍 **Artist search** — type a band or singer and get results in one click.
- 🎵 **Top track & album** — the artist's most played song and record.
- 👥 **Similar artists** — three artists with a comparable sound.
- 📱 **Responsive** — a single layout that works on both desktop and mobile.
- 🔒 **Server-side credentials** — all API keys stay on the server; the browser
  only ever talks to this app's own `/api/artist` route.
- ✅ **Unit tested** — the Last.fm client, formatting helpers, and search UI are
  covered by Vitest and Testing Library.

## Tech stack

| Concern      | Choice                                          |
| ------------ | ----------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)              |
| UI library   | React 19                                        |
| Language     | TypeScript                                      |
| Styling      | Tailwind CSS v4                                 |
| Testing      | Vitest + Testing Library                        |
| Data sources | Last.fm API (core data) + Spotify API (artwork) |

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
   Client ID and Client Secret. Without these, the app still works — it just
   shows fewer images.
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

```
src/
├── app/
│   ├── api/artist/route.ts   # Server route: looks up an artist and returns JSON
│   ├── layout.tsx            # Root layout, fonts, and metadata
│   ├── page.tsx              # Home page: search UI and result states
│   └── globals.css           # Tailwind entry point and base styles
├── components/
│   ├── SearchBar.tsx         # Accessible search form
│   ├── MediaCard.tsx         # Reusable artwork card (tracks, albums, artists)
│   └── ArtistResults.tsx     # Layout for a full result set
└── lib/
    ├── format.ts             # Compact number formatting (plays, listeners)
    ├── music/
    │   ├── types.ts          # Domain models rendered by the UI
    │   └── lookup.ts         # Orchestrates Last.fm data + Spotify artwork
    ├── lastfm/
    │   └── client.ts         # Typed Last.fm client (core data)
    └── spotify/
        ├── token.ts          # Client Credentials token fetching + caching
        ├── api.ts            # Shared Spotify fetch helper
        └── images.ts         # Best-effort artwork enrichment
```

## How it works

1. The browser calls the internal `/api/artist?q=<name>` route — every API key
   stays on the server.
2. `lookupArtist` fetches the artist's info from Last.fm (and returns a clean
   404 if the artist does not exist).
3. It then fetches the top track, top album, and similar artists from Last.fm in
   parallel.
4. For any entity missing artwork, it searches Spotify for an image in parallel.
   This step never blocks or fails the response.
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
- **`components/SearchBar`** — query submission, trimming, and disabled/loading
  states.

## License

This project is provided for educational purposes.
