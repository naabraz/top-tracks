import { LastfmLogo } from "./LastfmLogo";
import { SpotifyLogo } from "./SpotifyLogo";

/** Footer crediting the two data sources as plain inline links. */
export function PageFooter() {
  return (
    <footer className="site" id="sources">
      <div className="wrap">
        <p className="sources-head">Where the data comes from</p>
        <div className="sources">
          <a className="source lfm" href="https://www.last.fm" target="_blank" rel="noopener noreferrer">
            <span className="logo">
              <LastfmLogo />
            </span>
            <b>Last.fm</b>
          </a>
          <a className="source spo" href="https://www.spotify.com" target="_blank" rel="noopener noreferrer">
            <span className="logo">
              <SpotifyLogo />
            </span>
            <b>Spotify</b>
          </a>
        </div>
        <div className="colophon">
          <span>
            Listener counts and play totals from Last.fm · cover art and release years from Spotify.
          </span>
          <span>TopTracks · band discovery</span>
        </div>
      </div>
    </footer>
  );
}
