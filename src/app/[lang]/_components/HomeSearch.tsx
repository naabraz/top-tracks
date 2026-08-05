"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HeroSection } from "./HeroSection";
import { SearchStatus } from "./SearchStatus";
import { useArtistSearch } from "../_hooks/useArtistSearch";

/**
 * The search surface: keeps the `q` search param, the input, and the results
 * in step, and lands the reader on each new answer.
 *
 * Routing through the URL rather than local state is what makes a result
 * shareable and gives the discovery loop a history — back walks the reader
 * out through the artists they came in via.
 */
export function HomeSearch() {
  const router = useRouter();
  // The pathname carries the locale segment (`/en`, `/pt-BR`); pushing it
  // back keeps every search on the active locale without a proxy round trip.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(query);
  const [lastQuery, setLastQuery] = useState(query);
  const { status, result, errorCode } = useArtistSearch(query);

  const resultRef = useRef<HTMLElement>(null);
  // Only a search the reader just asked for should move them. Arriving on a
  // shared link, or restoring history, should leave their scroll alone.
  const revealPendingRef = useRef(false);

  // The field is theirs to type in, but the URL outranks it: going back, or
  // opening a shared link, has to put that artist in the box. Adjusting during
  // render is React's own answer here — an effect would render the stale value
  // first and then correct it.
  if (query !== lastQuery) {
    setLastQuery(query);
    setInputValue(query);
  }

  useEffect(() => {
    if (status !== "success" || !result) return;
    if (!revealPendingRef.current) return;

    const target = resultRef.current;
    if (!target) return;

    revealPendingRef.current = false;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    // The scroll is the reveal for readers who can see it; focus is what
    // carries the same news to keyboard and screen-reader users.
    target.focus({ preventScroll: true });
  }, [status, result]);

  function goToArtist(name: string) {
    revealPendingRef.current = true;
    // Next scrolls to the top on navigation by default, which would fight the
    // reveal below.
    router.push(`${pathname}?q=${encodeURIComponent(name)}`, { scroll: false });
  }

  return (
    <>
      <HeroSection
        value={inputValue}
        onChange={setInputValue}
        onSearch={goToArtist}
        isLoading={status === "loading"}
      />
      <main className="wrap">
        <SearchStatus
          status={status}
          errorCode={errorCode}
          query={query}
          result={result}
          onSelectArtist={goToArtist}
          resultRef={resultRef}
        />
      </main>
    </>
  );
}
