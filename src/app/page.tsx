import { Suspense } from "react";
import { SiteHeader } from "./_components/SiteHeader";
import { HomeSearch } from "./_components/HomeSearch";
import { HomeSearchFallback } from "./_components/HomeSearchFallback";
import { PageFooter } from "./_components/PageFooter";

export default function Home() {
  return (
    <>
      <SiteHeader />
      {/* HomeSearch reads the `q` search param, which Next can only resolve on
          the client. The boundary keeps that cost local: the header, the
          footer, and the fallback hero still prerender. */}
      <Suspense fallback={<HomeSearchFallback />}>
        <HomeSearch />
      </Suspense>
      <PageFooter />
    </>
  );
}
