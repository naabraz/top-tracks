import Link from "next/link";
import type { Dictionary, Locale } from "@/lib/i18n/types";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SiteHeaderProps {
  locale: Locale;
  header: Dictionary["header"];
}

/** Sticky brand bar: amber waveform mark + the TopTracks wordmark. */
export function SiteHeader({ locale, header }: SiteHeaderProps) {
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
          <Link href={`/${locale}`} aria-label={header.homeLinkLabel}>
            <b>TopTracks</b>
          </Link>
          <span>{header.tagline}</span>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
