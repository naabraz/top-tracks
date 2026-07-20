/** Sticky brand bar: amber waveform mark + the TopTracks wordmark. */
export function SiteHeader() {
  return (
    <header className='site'>
      <div className='wrap'>
        <div className='brand'>
          <span className='mark' aria-hidden='true'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='oklch(16% 0.02 262)'
              strokeWidth='2.4'
              strokeLinecap='round'
            >
              <path d='M3 12h2l2-6 3 12 3-15 3 15 2-6h3' />
            </svg>
          </span>
          <a href='/' aria-label='TopTracks home'>
            <b>TopTracks</b>
          </a>
          <span>band discovery</span>
        </div>
      </div>
    </header>
  );
}
