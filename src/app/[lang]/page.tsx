import { Suspense } from "react";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { SiteHeader } from "./_components/SiteHeader";
import { HomeSearch } from "./_components/HomeSearch";
import { HomeSearchFallback } from "./_components/HomeSearchFallback";
import { PageFooter } from "./_components/PageFooter";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }

  // Server components cannot read the LocaleProvider context, so the page
  // hands SiteHeader and PageFooter their dictionary slices as props.
  const dictionary = await getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} header={dictionary.header} />
      {/* HomeSearch reads the `q` search param, which Next can only resolve on
          the client. The boundary keeps that cost local: the header, the
          footer, and the fallback hero still prerender. */}
      <Suspense fallback={<HomeSearchFallback />}>
        <HomeSearch />
      </Suspense>
      <PageFooter footer={dictionary.footer} />
    </>
  );
}
