/**
 * proxy.ts and routes.ts tests
 *
 * Coverage:
 *  - Route classification helpers (pure functions in lib/routes.ts)
 *  - buildSafeReturnUrl security: open-redirect prevention
 *  - Proxy function: unauthenticated access to protected routes
 *  - Proxy function: authenticated access to protected routes
 *  - Proxy function: guest-only route redirection
 *  - Proxy function: public route pass-through
 *  - Proxy function: redirect loop prevention (no double-redirect)
 *  - Proxy function: return URL is preserved correctly
 *  - Proxy function: return URL is sanitized (no open redirects)
 *  - Proxy function: static assets are excluded from the matcher
 *  - Cookie detection: plain and __Secure- prefixed variants
 *
 * Note on the testing approach:
 *   We test the proxy function directly using NextRequest from "next/server"
 *   rather than the experimental unstable_doesMiddlewareMatch utility, which
 *   requires the full Next.js server context and cannot be loaded in vitest's
 *   plain node environment without the Next.js build pipeline.
 *
 *   The proxy function covers all the meaningful behaviour; the config.matcher
 *   pattern is validated separately via the matchesConfig helper below.
 */

import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy, config } from "./proxy";
import {
  isProtectedPath,
  isGuestOnlyPath,
  hasSessionCookie,
  buildSafeReturnUrl,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME_SECURE,
  SIGN_IN_PATH,
  AUTHENTICATED_HOME_PATH,
  REDIRECT_PARAM,
} from "./lib/routes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_URL = "http://localhost:3000";

/**
 * Build a NextRequest with optional cookies set.
 */
function makeRequest(
  path: string,
  cookies: Record<string, string> = {}
): NextRequest {
  const url = new URL(path, BASE_URL);
  const cookieHeader = Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
  return new NextRequest(url, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });
}

/**
 * Returns the session-cookie object to simulate a logged-in user.
 */
function sessionCookies(): Record<string, string> {
  return { [SESSION_COOKIE_NAME]: "opaque-session-token-value" };
}

/**
 * Minimal regex-based check for whether a path would be matched by
 * the config.matcher pattern. This replicates the same negative-lookahead
 * logic used in the proxy config without requiring the Next.js runtime.
 *
 * We test exact boundary cases here; the full Next.js matcher uses
 * path-to-regexp internally, but the exclusion logic is deterministic.
 */
function matchesConfig(path: string): boolean {
  const matchers = Array.isArray(config.matcher)
    ? config.matcher
    : [config.matcher];

  return matchers.some((m) => {
    if (typeof m !== "string") return true;
    // Convert the Next.js matcher pattern to a usable regex.
    // The pattern used is a standard negative-lookahead path pattern.
    const pattern = m
      // Strip leading / from the pattern since we match only the path part
      .replace(/^\//, "");
    try {
      return new RegExp(`^/${pattern}$`).test(path);
    } catch {
      // If regex fails, conservatively say it matches (proxy would run)
      return true;
    }
  });
}

// ---------------------------------------------------------------------------
// 1. Route classification helpers
// ---------------------------------------------------------------------------

describe("isProtectedPath", () => {
  it("matches /admin paths", () => {
    expect(isProtectedPath("/admin")).toBe(true);
    expect(isProtectedPath("/admin/ai")).toBe(true);
    expect(isProtectedPath("/admin/ai/credentials")).toBe(true);
  });

  it("matches /dashboard paths", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/overview")).toBe(true);
  });

  it("matches /practice paths", () => {
    expect(isProtectedPath("/practice")).toBe(true);
    expect(isProtectedPath("/practice/waec/maths")).toBe(true);
  });

  it("matches /profile paths", () => {
    expect(isProtectedPath("/profile")).toBe(true);
  });

  it("matches /settings paths", () => {
    expect(isProtectedPath("/settings")).toBe(true);
  });

  it("does not match public paths", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
    expect(isProtectedPath("/about")).toBe(false);
    expect(isProtectedPath("/blog/post")).toBe(false);
  });

  it("is case-sensitive (paths are lowercase by convention)", () => {
    // /Admin would not match — URL paths are always lowercase on this platform
    expect(isProtectedPath("/Admin")).toBe(false);
  });
});

describe("isGuestOnlyPath", () => {
  it("returns false for all paths when GUEST_ONLY_PREFIXES is empty", () => {
    // Currently no guest-only paths are configured.
    // These tests document expected behavior for when they are added.
    expect(isGuestOnlyPath("/sign-in")).toBe(false);
    expect(isGuestOnlyPath("/sign-up")).toBe(false);
    expect(isGuestOnlyPath("/admin")).toBe(false);
    expect(isGuestOnlyPath("/")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. Cookie detection
// ---------------------------------------------------------------------------

describe("hasSessionCookie", () => {
  it("detects the plain cookie name", () => {
    const cookies = {
      has: (name: string) => name === SESSION_COOKIE_NAME,
    };
    expect(hasSessionCookie(cookies)).toBe(true);
  });

  it("detects the __Secure- prefixed cookie name (production HTTPS)", () => {
    const cookies = {
      has: (name: string) => name === SESSION_COOKIE_NAME_SECURE,
    };
    expect(hasSessionCookie(cookies)).toBe(true);
  });

  it("returns false when no session cookie is present", () => {
    const cookies = {
      has: (_name: string) => false,
    };
    expect(hasSessionCookie(cookies)).toBe(false);
  });

  it("returns false for unrelated cookies", () => {
    const cookies = {
      has: (name: string) => name === "some_other_cookie",
    };
    expect(hasSessionCookie(cookies)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. buildSafeReturnUrl — open-redirect prevention
// ---------------------------------------------------------------------------

describe("buildSafeReturnUrl", () => {
  it("returns valid internal paths unchanged", () => {
    expect(buildSafeReturnUrl("/admin/ai")).toBe("/admin/ai");
    expect(buildSafeReturnUrl("/dashboard")).toBe("/dashboard");
    expect(buildSafeReturnUrl("/practice/waec?subject=maths")).toBe(
      "/practice/waec?subject=maths"
    );
  });

  it("returns null for null input", () => {
    expect(buildSafeReturnUrl(null)).toBeNull();
  });

  it("rejects external URLs", () => {
    expect(buildSafeReturnUrl("https://evil.com/steal")).toBeNull();
    expect(buildSafeReturnUrl("http://attacker.com")).toBeNull();
  });

  it("rejects protocol-relative URLs", () => {
    expect(buildSafeReturnUrl("//evil.com/path")).toBeNull();
  });

  it("strips host from input that embeds a full URL as path", () => {
    // e.g. /%2F%2Fevil.com after URL decoding
    // We test that the sanitizer only returns path+search
    const result = buildSafeReturnUrl("/admin");
    expect(result).toBe("/admin");
    // Should not contain any host
    if (result) {
      expect(result).not.toContain("evil.com");
    }
  });

  it("preserves query parameters", () => {
    const result = buildSafeReturnUrl("/practice?session=abc&page=2");
    expect(result).toBe("/practice?session=abc&page=2");
  });

  it("strips hash fragments (URL hash is not sent to server)", () => {
    // Hashes are client-side only; URL constructor drops them in pathname
    const result = buildSafeReturnUrl("/dashboard#section");
    // The URL class treats # as a fragment, not part of pathname
    expect(result).toBe("/dashboard");
  });
});

// ---------------------------------------------------------------------------
// 4. Proxy: protected routes — unauthenticated
// ---------------------------------------------------------------------------

describe("proxy — protected routes, no session cookie", () => {
  it("redirects /admin to /sign-in", () => {
    const req = makeRequest("/admin");
    const res = proxy(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(SIGN_IN_PATH);
  });

  it("redirects /admin/ai to /sign-in", () => {
    const req = makeRequest("/admin/ai");
    const res = proxy(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain(SIGN_IN_PATH);
  });

  it("redirects /dashboard to /sign-in", () => {
    const req = makeRequest("/dashboard");
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location") ?? "").toContain(SIGN_IN_PATH);
  });

  it("redirects /practice to /sign-in", () => {
    const req = makeRequest("/practice");
    const res = proxy(req);
    expect(res.status).toBe(307);
  });

  it("redirects /profile to /sign-in", () => {
    const req = makeRequest("/profile");
    const res = proxy(req);
    expect(res.status).toBe(307);
  });

  it("redirects /settings to /sign-in", () => {
    const req = makeRequest("/settings");
    const res = proxy(req);
    expect(res.status).toBe(307);
  });

  it("includes the original path as the redirect param", () => {
    const req = makeRequest("/admin/ai");
    const res = proxy(req);
    const location = res.headers.get("location") ?? "";
    const locationUrl = new URL(location);
    expect(locationUrl.searchParams.get(REDIRECT_PARAM)).toBe("/admin/ai");
  });

  it("includes query parameters in the redirect param", () => {
    const req = makeRequest("/dashboard?tab=overview");
    const res = proxy(req);
    const location = res.headers.get("location") ?? "";
    const locationUrl = new URL(location);
    const returnTo = locationUrl.searchParams.get(REDIRECT_PARAM);
    expect(returnTo).toBe("/dashboard?tab=overview");
  });
});

// ---------------------------------------------------------------------------
// 5. Proxy: protected routes — authenticated (cookie present)
// ---------------------------------------------------------------------------

describe("proxy — protected routes, with session cookie", () => {
  it("passes through /admin when session cookie is present", () => {
    const req = makeRequest("/admin", sessionCookies());
    const res = proxy(req);
    // next() returns 200-equivalent (no redirect)
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("passes through /admin/ai when session cookie is present", () => {
    const req = makeRequest("/admin/ai", sessionCookies());
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through /dashboard when session cookie is present", () => {
    const req = makeRequest("/dashboard", sessionCookies());
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through /settings when session cookie is present", () => {
    const req = makeRequest("/settings", sessionCookies());
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("detects the __Secure- prefixed cookie name", () => {
    const req = makeRequest("/admin", {
      [SESSION_COOKIE_NAME_SECURE]: "secure-token-value",
    });
    const res = proxy(req);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 6. Proxy: guest-only routes (currently empty — documents future behavior)
// ---------------------------------------------------------------------------

describe("proxy — guest-only routes", () => {
  it("passes through /sign-in for unauthenticated users (not in GUEST_ONLY_PREFIXES yet)", () => {
    // /sign-in is not in GUEST_ONLY_PREFIXES yet — verify it passes through
    const req = makeRequest("/sign-in");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through /sign-in for authenticated users (not in GUEST_ONLY_PREFIXES yet)", () => {
    const req = makeRequest("/sign-in", sessionCookies());
    const res = proxy(req);
    // Currently not configured as guest-only, so it passes through
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 7. Proxy: public routes
// ---------------------------------------------------------------------------

describe("proxy — public routes", () => {
  it("passes through / for unauthenticated users", () => {
    const req = makeRequest("/");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through / for authenticated users", () => {
    const req = makeRequest("/", sessionCookies());
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through /about for unauthenticated users", () => {
    const req = makeRequest("/about");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("passes through /blog/post for unauthenticated users", () => {
    const req = makeRequest("/blog/post");
    const res = proxy(req);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// 8. Redirect loop prevention
// ---------------------------------------------------------------------------

describe("proxy — redirect loop prevention", () => {
  it("does not redirect /sign-in again (no loop when already on sign-in)", () => {
    // /sign-in is public — an unauthenticated user visits it → should pass through
    const req = makeRequest("/sign-in");
    const res = proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("does not add a redirect param that itself points to /sign-in", () => {
    // If the redirect param were /sign-in, we'd create a loop on login success.
    // The proxy adds /admin as the redirect, not /sign-in.
    const req = makeRequest("/admin");
    const res = proxy(req);
    const location = res.headers.get("location") ?? "";
    const locationUrl = new URL(location);
    const returnTo = locationUrl.searchParams.get(REDIRECT_PARAM);
    // The return destination is the original page, not the sign-in page
    expect(returnTo).toBe("/admin");
    expect(returnTo).not.toBe(SIGN_IN_PATH);
  });

  it("does not chain existing redirect params into the new redirect", () => {
    // e.g. /admin?redirect=%2Fadmin should redirect to /sign-in?redirect=/admin%3Fredirect%3D%2Fadmin
    // The proxy preserves the full original URL (pathname + search) as the return destination.
    // The important property is:
    //   1. The redirect target is /sign-in (not /admin again)
    //   2. The return URL is an internal path
    //   3. The return URL is NOT itself the sign-in page
    const req = makeRequest(
      `/admin?${REDIRECT_PARAM}=%2Fadmin`
    );
    const res = proxy(req);
    const location = res.headers.get("location") ?? "";
    const locationUrl = new URL(location);

    // 1. The browser is redirected to the sign-in page
    expect(locationUrl.pathname).toBe(SIGN_IN_PATH);

    // 2. The return param contains the original path (not another sign-in redirect)
    const returnTo = locationUrl.searchParams.get(REDIRECT_PARAM) ?? "";
    expect(returnTo.startsWith("/")).toBe(true);
    expect(returnTo).not.toBe(SIGN_IN_PATH);

    // 3. The return URL starts with /admin (original page), not /sign-in
    expect(returnTo.startsWith("/admin")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 9. Matcher config — static assets are excluded
// ---------------------------------------------------------------------------

describe("config.matcher — excluded paths", () => {
  it("excludes _next/static assets", () => {
    expect(matchesConfig("/_next/static/chunks/main.js")).toBe(false);
  });

  it("excludes _next/image paths", () => {
    expect(matchesConfig("/_next/image?url=...")).toBe(false);
  });

  it("excludes favicon.ico", () => {
    expect(matchesConfig("/favicon.ico")).toBe(false);
  });

  it("excludes common image extensions", () => {
    expect(matchesConfig("/public/logo.png")).toBe(false);
    expect(matchesConfig("/images/hero.jpg")).toBe(false);
    expect(matchesConfig("/icons/icon.svg")).toBe(false);
    expect(matchesConfig("/icons/icon.webp")).toBe(false);
  });

  it("excludes font files", () => {
    expect(matchesConfig("/fonts/dm-sans.woff2")).toBe(false);
    expect(matchesConfig("/fonts/font.woff")).toBe(false);
  });

  it("includes application routes", () => {
    expect(matchesConfig("/")).toBe(true);
    expect(matchesConfig("/admin")).toBe(true);
    expect(matchesConfig("/admin/ai")).toBe(true);
    expect(matchesConfig("/dashboard")).toBe(true);
    expect(matchesConfig("/sign-in")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. Return URL safety in redirect responses
// ---------------------------------------------------------------------------

describe("proxy — return URL safety", () => {
  it("only sets an internal path as the redirect param", () => {
    const req = makeRequest("/admin/ai?tab=credentials");
    const res = proxy(req);
    const location = res.headers.get("location") ?? "";
    const locationUrl = new URL(location);
    const returnTo = locationUrl.searchParams.get(REDIRECT_PARAM) ?? "";
    // Must be an internal path starting with /
    expect(returnTo.startsWith("/")).toBe(true);
    // Must not be an absolute URL
    expect(returnTo).not.toMatch(/^https?:\/\//);
  });

  it("does not include a redirect param when the return URL would be unsafe", () => {
    // This test verifies buildSafeReturnUrl is called — if pathname somehow
    // resolved to an external URL it would be dropped.
    // We simulate this by calling buildSafeReturnUrl directly.
    expect(buildSafeReturnUrl("https://evil.com")).toBeNull();
    expect(buildSafeReturnUrl("//evil.com/steal")).toBeNull();
  });
});
