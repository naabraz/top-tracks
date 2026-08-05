"use client";

import { HeroSection } from "./HeroSection";
import { EmptyState } from "./EmptyState";

function noop() {}

/**
 * Prerendered stand-in for {@link HomeSearch}.
 *
 * Reading the `q` search param can only happen on the client, so Next renders
 * this into the static HTML instead. It mirrors a query-less visit, which is
 * what most arrivals are.
 */
export function HomeSearchFallback() {
  return (
    <>
      <HeroSection value="" onChange={noop} onSearch={noop} isLoading={false} />
      <main className="wrap">
        <EmptyState />
      </main>
    </>
  );
}
