"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { SkeletonBar } from "./SkeletonBar";

const SIMILAR_PLACEHOLDERS = [0, 1, 2];

/** Shimmering placeholder shown while the Last.fm + Spotify lookup resolves. */
export function ResultsSkeleton() {
  const { dictionary } = useTranslation();

  return (
    <section className="result" aria-busy="true" aria-label={dictionary.results.loadingLabel}>
      <span className="sr-only">{dictionary.results.loadingAnnouncement}</span>
      <div className="band-head">
        <div className="band-title">
          <SkeletonBar width="56px" height="12px" />
          <SkeletonBar width="min(340px, 66%)" height="60px" radius="12px" />
        </div>
        <div className="listeners">
          <SkeletonBar width="150px" height="40px" radius="10px" />
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <SkeletonBar width="100%" height="194px" radius="0" />
        </div>
        <div className="card">
          <SkeletonBar width="100%" height="194px" radius="0" />
        </div>
      </div>
      <div className="sim-grid">
        {SIMILAR_PLACEHOLDERS.map((index) => (
          <SkeletonBar key={index} width="100%" height="88px" radius="16px" />
        ))}
      </div>
    </section>
  );
}
