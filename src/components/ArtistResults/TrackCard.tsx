"use client";

import type { TrackSummary } from '@/lib/music/types';
import { formatCount } from '@/lib/format';
import { deriveHue } from '@/lib/hue';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Artwork } from '@/components/Artwork';
import { CardShell } from './CardShell';
import { TrackAlbumMeta } from './TrackAlbumMeta';

/** The answer carries the larger cover; the album card keeps the default 150. */
const TRACK_ARTWORK_SIZE = 190;

interface TrackCardProps {
  track: TrackSummary | null;
}

/** The most-played track: the headline answer — cover, title, and play total. */
export function TrackCard({ track }: TrackCardProps) {
  const { dictionary, locale } = useTranslation();

  if (!track) {
    return (
      <CardShell label={dictionary.results.topTrackLabel} note={dictionary.results.noTrack} />
    );
  }

  return (
    <div className='card'>
      <div className='track'>
        <Artwork
          imageUrl={track.imageUrl}
          hue={deriveHue(track.artistName)}
          alt={track.name}
          size={TRACK_ARTWORK_SIZE}
        />
        <div className='track-info'>
          <p className='label'>{dictionary.results.topTrackLabel}</p>
          <h3>
            <a href={track.url} target='_blank' rel='noopener noreferrer'>
              {track.name}
            </a>
          </h3>
          <TrackAlbumMeta albumName={track.albumName} releaseYear={track.albumReleaseYear} />
          <p className='plays'>
            <b>{formatCount(track.playcount, locale)}</b>
            <small>{dictionary.results.plays}</small>
          </p>
        </div>
      </div>
    </div>
  );
}
