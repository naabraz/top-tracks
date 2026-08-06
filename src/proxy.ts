import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE_NAME, LOCALES, negotiateLocale } from "@/lib/i18n/locales";

/**
 * Redirects unprefixed URLs to their locale-prefixed equivalent so legacy
 * bookmarks (`/`, `/?q=…`) keep working. 307 keeps the choice re-negotiable —
 * a permanent redirect would let browsers cache one locale forever.
 */
export function proxy(request: NextRequest): NextResponse | undefined {
  const { pathname } = request.nextUrl;
  if (hasLocalePrefix(pathname)) {
    return undefined;
  }

  const locale = negotiateLocale(
    request.headers.get("accept-language"),
    request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null,
  );
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(redirectUrl, 307);
}

function hasLocalePrefix(pathname: string): boolean {
  return LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export const config = {
  // Skip API routes, Next internals, and files with extensions (favicon,
  // images) — only page navigations should be locale-redirected.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
