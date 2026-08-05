"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

/** The hero: eyebrow, editorial headline, and supporting lede. */
export function PageHeader() {
  const { dictionary } = useTranslation();
  const { hero } = dictionary;

  return (
    <>
      <p className="eyebrow">{hero.eyebrow}</p>
      <h1>
        {hero.headlineLead}
        <br />
        {hero.headlineEmphasisPrefix} <em>{hero.headlineEmphasis}</em>
      </h1>
      <p className="lede">{hero.lede}</p>
    </>
  );
}
