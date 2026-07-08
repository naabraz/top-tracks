# TopTracks

A responsive web app that lets you search for any artist or band and instantly
see their **most popular track**, their **most popular album**, and **three
similar artists** — all powered by the [Spotify Web API](https://developer.spotify.com/documentation/web-api).

Built with the latest versions of Next.js (App Router), React, TypeScript,
Tailwind CSS, and Vitest.

## Features

- 🔍 **Artist search** — type a band or singer and get results in one click.
- 🎵 **Top track & album** — the artist's most popular song and record, ranked by
  Spotify's popularity score.
- 👥 **Similar artists** — three artists with a comparable sound.
- 📱 **Responsive** — a single layout that works on both desktop and mobile.
- 🔒 **Server-side credentials** — Spotify tokens are requested on the server via
  the Client Credentials flow and never exposed to the browser.
- ✅ **Unit tested** — the API client, formatting helpers, and search UI are
  covered by Vitest and Testing Library.

## Tech stack

| Concern        | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)        |
| UI library     | React 19                                  |
| Language       | TypeScript                                |
| Styling        | Tailwind CSS v4                           |
| Testing        | Vitest + Testing Library                  |
| Data source    | Spotify Web API (Client Credentials flow) |

## Getting started

### Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- A Spotify developer application (see below)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Spotify credentials

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   and create an app to obtain a **Client ID** and **Client Secret**.
2. Copy the example environment file and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   ```dotenv
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   ```

> **Note:** A `.env.local` file with placeholder (dummy) values is included so the
> project builds out of the box. Replace those values with real credentials
> before the search will return live data. `.env.local` is gitignored and must
> never be committed.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search for an artist.

## Available scripts

| Script               | Description                       |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start the development server.     |
| `npm run build`      | Create an optimized production build. |
| `npm run start`      | Serve the production build.       |
| `npm run lint`       | Run ESLint.                       |
| `npm test`           | Run the unit tests once.          |
| `npm run test:watch` | Run the unit tests in watch mode. |

## Project structure

```
src/
├── app/
│   ├── api/artist/route.ts   # Server route that queries Spotify and returns results
│   ├── layout.tsx            # Root layout, fonts, and metadata
│   ├── page.tsx              # Home page: search UI and result states
│   └── globals.css           # Tailwind entry point and base styles
├── components/
│   ├── SearchBar.tsx         # Accessible search form
│   ├── MediaCard.tsx         # Reusable artwork card (tracks, albums, artists)
│   └── ArtistResults.tsx     # Layout for a full result set
└── lib/
    ├── format.ts             # Duration, follower, and date formatting helpers
    └── spotify/
        ├── token.ts          # Client Credentials token fetching + caching
        ├── client.ts         # Typed Spotify API client and domain mapping
        └── types.ts          # Spotify response types and domain models
```

## How it works

1. The browser calls the internal `/api/artist?q=<name>` route — the Spotify
   credentials stay on the server.
2. The server fetches an app access token (cached until shortly before it
   expires) using the **Client Credentials** flow.
3. It searches for the best-matching artist, then fetches — in parallel — the
   artist's top track, most popular album, and similar artists.
4. The results are mapped into small domain models and returned as JSON, which
   the page renders into responsive cards.

### A note on "similar artists"

Spotify's dedicated related-artists endpoint is unavailable for apps created
after November 2024. When that endpoint responds with a `403`/`404`, the client
falls back to searching for other artists that share the primary genre, so the
feature keeps working regardless of when your Spotify app was created.

## Testing

```bash
npm test
```

The suite covers:

- **`lib/format`** — duration, follower-count, and release-year formatting.
- **`lib/spotify/client`** — artist search, top-track/album selection, the
  similar-artists fallback, and error paths (with `fetch` mocked).
- **`components/SearchBar`** — query submission, trimming, and disabled/loading
  states.

## License

This project is provided for educational purposes.
