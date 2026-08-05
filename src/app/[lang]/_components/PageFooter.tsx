import type { Dictionary } from "@/lib/i18n/types";
import { LastfmLogo } from "./LastfmLogo";
import { SpotifyLogo } from "./SpotifyLogo";

interface PageFooterProps {
  footer: Dictionary["footer"];
}

/** Footer crediting the two data sources as plain inline links. */
export function PageFooter({ footer }: PageFooterProps) {
  return (
    <footer className="site" id="sources">
      <div className="wrap">
        <p className="sources-head">{footer.sourcesHead}</p>
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
          <span>{footer.colophonSources}</span>
          <span>{footer.colophonBrand}</span>
        </div>
      </div>
    </footer>
  );
}
