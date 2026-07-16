interface WaveformProps {
  seed: number;
}

const BAR_COUNT = 40;

/** Builds a deterministic set of bar heights so the same track always matches. */
function buildBarHeights(seed: number): number[] {
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    const wave = Math.abs(Math.sin(index * 0.7 + seed * 0.13)) * 70;
    const accent = index % 5 === 0 ? 12 : 0;
    return Math.min(100, 25 + wave + accent);
  });
}

/** Decorative equaliser waveform for the top-track card. */
export function Waveform({ seed }: WaveformProps) {
  return (
    <div className="wave" aria-hidden="true">
      {buildBarHeights(seed).map((height, index) => (
        <i key={index} style={{ height: `${height}%`, animationDelay: `${(index % 7) * 0.09}s` }} />
      ))}
    </div>
  );
}
