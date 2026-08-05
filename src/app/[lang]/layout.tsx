import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { LOCALES, hasLocale } from "@/lib/i18n/locales";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildMetadata } from "@/lib/i18n/metadata";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import "../globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }
  return buildMetadata(lang);
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) {
    notFound();
  }

  const dictionary = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${instrumentSerif.variable} ${inter.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body>
        <LocaleProvider locale={lang} dictionary={dictionary}>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
