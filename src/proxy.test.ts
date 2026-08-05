// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

function createRequest(
  path: string,
  options: { acceptLanguage?: string; localeCookie?: string } = {},
): NextRequest {
  const headers = new Headers();
  if (options.acceptLanguage) {
    headers.set("accept-language", options.acceptLanguage);
  }
  if (options.localeCookie) {
    headers.set("cookie", `top-tracks-locale=${options.localeCookie}`);
  }
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe("proxy", () => {
  it("redirects / to /en with no cookie and no language preference", () => {
    const response = proxy(createRequest("/"));

    expect(response?.headers.get("location")).toBe("http://localhost:3000/en");
  });

  it("redirects / to /pt-BR when Accept-Language prefers Portuguese", () => {
    const request = createRequest("/", { acceptLanguage: "pt-BR,pt;q=0.9,en;q=0.8" });

    const response = proxy(request);

    expect(response?.headers.get("location")).toBe("http://localhost:3000/pt-BR");
  });

  it("redirects / to the cookie's locale, overriding the header", () => {
    const request = createRequest("/", {
      acceptLanguage: "pt-BR,pt;q=0.9",
      localeCookie: "en",
    });

    const response = proxy(request);

    expect(response?.headers.get("location")).toBe("http://localhost:3000/en");
  });

  it("preserves the query string when redirecting", () => {
    const response = proxy(createRequest("/?q=Opeth"));

    expect(response?.headers.get("location")).toBe("http://localhost:3000/en?q=Opeth");
  });

  it("passes through a locale-prefixed root path without redirecting", () => {
    const response = proxy(createRequest("/en"));

    expect(response).toBeUndefined();
  });

  it("passes through a locale-prefixed path with a query without redirecting", () => {
    const response = proxy(createRequest("/pt-BR?q=Opeth"));

    expect(response).toBeUndefined();
  });

  it("redirects with a 307 status so bookmarks are not permanently rewritten", () => {
    const response = proxy(createRequest("/"));

    expect(response?.status).toBe(307);
  });
});
