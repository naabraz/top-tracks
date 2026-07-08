# TopTracks

A responsive web app that lets you search for any artist or band and instantly
see their **most played track**, their **most played album**, and **three
similar artists**, powered by the [Last.fm API](https://www.last.fm/api).

Built with the latest versions of Next.js (App Router), React, TypeScript,
Tailwind CSS, and Vitest.

> **Why Last.fm?** The app was originally designed around the Spotify Web API,
> but Spotify restricted the top-tracks, related-artists, and popularity data for
> apps created after its late-2024 policy change (they return `403 Forbidden` or
> are stripped from responses). Last.fm exposes exactly the rankings this app
> needs — `artist.getTopTracks`, `artist.getTopAlbums`, and `artist.getSimilar`
> are ordered by play count and listeners.

## Features

- 🔍 **Artist search** — type a band or singer and get results in one click.
- 🎵 **Top track & album** — the artist's most played song and record.
- 👥 **Similar artists** — three artists with a comparable sound.
- 📱 **Responsive** — a single layout that works on both desktop and mobile.
- 🔒 **Server-side credentials** — the API key stays on the server; the browser
  only ever talks to this app's own `/api/artist` route.
- ✅ **Unit tested** — the Last.fm client, the lookup orchestration, the
  formatting helpers, and the search UI are covered by Vitest and Testing
  Library.

## Tech stack

| Concern     | Choice                             |
| ----------- | ---------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack) |
| UI library  | React 19                           |
| Language    | TypeScript                         |
| Styling     | Tailwind CSS v4                    |
| Testing     | Vitest + Testing Library           |
| Data source | Last.fm API                        |

## Getting started

### Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- A Last.fm API account

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your Last.fm API key

1. Create a **Last.fm API account** at
   [last.fm/api/account/create](https://www.last.fm/api/account/create) to get an
   API key.
2. Copy the example environment file and fill in your key:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   LASTFM_API_KEY=your-lastfm-api-key
   ```

> **Note:** A `.env.local` with a placeholder (dummy) value is included so the
> project builds out of the box. Searches will only return live data once the key
> is real. `.env.local` is gitignored and must never be committed.

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
    │   └── lookup.ts         # Orchestrates the Last.fm calls into one result
    └── lastfm/
        └── client.ts         # Typed Last.fm client
```

## How it works

1. The browser calls the internal `/api/artist?q=<name>` route — the API key
   stays on the server.
2. `lookupArtist` fetches the artist's info from Last.fm (and returns a clean
   404 if the artist does not exist).
3. It then fetches the top track, top album, and similar artists in parallel and
   returns them as JSON.
4. The page renders the result into responsive cards.

## Testing

```bash
npm test
```

The suite covers:

- **`lib/format`** — compact number formatting.
- **`lib/lastfm/client`** — artist info, top track/album, similar artists, the
  not-found path, the placeholder-image filter, and error handling (with `fetch`
  mocked).
- **`lib/music/lookup`** — the orchestration and the track-image fallback (with
  the Last.fm client mocked).
- **`components/SearchBar`** — query submission, trimming, and disabled/loading
  states.

## License

This project is provided for educational purposes.
