/**
 * Examinr — Next.js 16 Proxy (route protection)
 *
 * This file replaces the old middleware.ts convention (renamed in Next.js 16).
 * It runs on the Node.js runtime before routes are rendered.
 *
 * WHAT THIS PROXY DOES
 * --------------------
 * 1. Checks for the presence of the Better Auth session cookie.
 * 2. Redirects unauthenticated visitors away from protected pages.
 * 3. Preserves the original destination as a safe return URL.
 * 4. Redirects authenticated visitors away from guest-only pages.
 * 5. Lets all other requests through without interference.
 *
 * WHAT THIS PROXY DOES NOT DO
 * ---------------------------
 * - It does NOT validate the session. Cookie presence ≠ valid session.
 * - It does NOT replace server-side authorization.
 * - Every protected API endpoint, Server Component, and Server Action
 *   must independently validate the session through Better Auth.
 *
 * ROUTE CLASSIFICATION
 * --------------------
 * All route rules live in lib/routes.ts. Add new protected paths there —
 * do not scatter authentication checks throughout the application.
 *
 * MATCHER
 * -------
 * The matcher excludes static assets, Next.js internals, fonts, images,
 * and known public resource paths so the proxy never runs for them.
 * This keeps per-request overhead minimal.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isProtectedPath,
  isGuestOnlyPath,
  hasSessionCookie,
  buildSafeReturnUrl,
  SIGN_IN_PATH,
  AUTHENTICATED_HOME_PATH,
  REDIRECT_PARAM,
} from "./lib/routes";

export function proxy(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = hasSessionCookie(request.cookies);

  // ------------------------------------------------------------------
  // Protected route — requires authentication
  // ------------------------------------------------------------------
  if (isProtectedPath(pathname)) {
    if (!hasSession) {
      // Build a safe return URL so the sign-in page can redirect back.
      const destination = new URL(SIGN_IN_PATH, request.url);
      const safeReturn = buildSafeReturnUrl(
        pathname + (request.nextUrl.search || "")
      );
      if (safeReturn) {
        destination.searchParams.set(REDIRECT_PARAM, safeReturn);
      }
      return NextResponse.redirect(destination);
    }
    // Session cookie present — let the request through.
    // The page/API itself must still validate the session server-side.
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // Guest-only route — authenticated users are redirected away
  // ------------------------------------------------------------------
  if (isGuestOnlyPath(pathname)) {
    if (hasSession) {
      // Honour an existing redirect param if set, otherwise go to dashboard.
      const returnTo = buildSafeReturnUrl(
        searchParams.get(REDIRECT_PARAM)
      );
      const destination = new URL(
        returnTo ?? AUTHENTICATED_HOME_PATH,
        request.url
      );
      return NextResponse.redirect(destination);
    }
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // Public route — pass through
  // ------------------------------------------------------------------
  return NextResponse.next();
}

/**
 * Matcher — which paths the proxy runs on.
 *
 * We use a negative lookahead to exclude:
 *  - _next/static  — compiled JS/CSS assets
 *  - _next/image   — image optimisation endpoint
 *  - _next/data    — data fetching for pre-rendered pages
 *  - api/          — API routes handled by Next.js (not our Hono API)
 *  - favicon.ico, sitemap.xml, robots.txt — well-known metadata files
 *  - Public assets matching common extensions (svg, png, jpg, ico, woff2, etc.)
 *
 * Note: even when _next/data is excluded in the negative lookahead, Next.js
 * still invokes the proxy for _next/data routes by design (security measure).
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)).*)",
  ],
};
