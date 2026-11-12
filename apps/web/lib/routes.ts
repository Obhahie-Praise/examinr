/**
 * Route classification for Examinr.
 *
 * This is the single source of truth for which routes require authentication,
 * which are guest-only, and which are always public.
 *
 * Adding a new protected page:
 *   1. Add its path prefix to PROTECTED_PREFIXES.
 *   2. That is all — the proxy picks it up automatically.
 *
 * Adding a new guest-only page (e.g. a marketing page that redirects
 * signed-in users to their dashboard):
 *   1. Add its path prefix to GUEST_ONLY_PREFIXES.
 *
 * Security note:
 *   These rules are early-navigation signals only. They do NOT replace
 *   server-side session validation. Every protected API endpoint and every
 *   Server Component or Server Action that accesses private data must
 *   independently validate the session through Better Auth.
 */

// ---------------------------------------------------------------------------
// Better Auth cookie configuration
// ---------------------------------------------------------------------------

/**
 * The session cookie set by Better Auth.
 *
 * Better Auth's default cookie format is:
 *   ${cookiePrefix}.session_token
 *
 * The default prefix is "better-auth" (see apps/api/src/auth/auth.ts).
 * If you change `advanced.cookiePrefix` in auth.ts, update this constant.
 *
 * In production with HTTPS, Better Auth also sets a prefixed __Secure- variant.
 * We check for both so the proxy works in local development and production.
 */
export const SESSION_COOKIE_NAME = "better-auth.session_token";

/**
 * The __Secure- prefixed variant set by browsers in production (HTTPS).
 * Better Auth may set this alongside the plain cookie when useSecureCookies is true.
 */
export const SESSION_COOKIE_NAME_SECURE = `__Secure-${SESSION_COOKIE_NAME}`;

// ---------------------------------------------------------------------------
// Route classification
// ---------------------------------------------------------------------------

/**
 * Path prefixes that require an authenticated session.
 *
 * Any path that starts with one of these prefixes will redirect unauthenticated
 * visitors to the sign-in page, preserving the original destination as a
 * `redirect` query parameter.
 *
 * Keep these sorted and document what each prefix covers.
 */
export const PROTECTED_PREFIXES: readonly string[] = [
  "/admin",    // Super-admin dashboard (AI Gateway, future admin tools)
  "/dashboard", // Student dashboard (not yet built, reserved)
  "/practice",  // Practice sessions (not yet built, reserved)
  "/profile",   // Student profile (not yet built, reserved)
  "/settings",  // Account settings (not yet built, reserved)
];

/**
 * Path prefixes that are only for guests (unauthenticated visitors).
 *
 * Any path that starts with one of these prefixes will redirect already-
 * authenticated visitors to their dashboard. This prevents signed-in users
 * from hitting the sign-in or sign-up pages.
 *
 * Leave empty until actual sign-in/sign-up pages are built.
 * Example after those pages exist:
 *   "/sign-in", "/sign-up", "/forgot-password"
 */
export const GUEST_ONLY_PREFIXES: readonly string[] = [
  // "/sign-in",
  // "/sign-up",
  // "/forgot-password",
];

// ---------------------------------------------------------------------------
// Destination constants
// ---------------------------------------------------------------------------

/**
 * Where unauthenticated visitors are redirected from protected pages.
 * Update this when the actual sign-in page is built.
 */
export const SIGN_IN_PATH = "/sign-in";

/**
 * Where authenticated visitors are redirected from guest-only pages.
 * Update this when the student dashboard is built.
 */
export const AUTHENTICATED_HOME_PATH = "/dashboard";

/**
 * Query parameter used to preserve the original destination so the sign-in
 * page can redirect back after a successful login.
 *
 * Example: /sign-in?redirect=%2Fadmin%2Fai
 */
export const REDIRECT_PARAM = "redirect";

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Returns true if the given pathname requires authentication.
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Returns true if the given pathname is restricted to guests only.
 */
export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Returns true if the cookie string contains a Better Auth session cookie.
 *
 * We check for both the plain name and the __Secure- variant so the proxy
 * works in HTTP (local dev) and HTTPS (production) environments.
 *
 * IMPORTANT: Cookie presence is NOT proof that the session is valid.
 * This check is an early navigation signal only. The actual session must
 * be validated server-side through Better Auth on every protected request.
 */
export function hasSessionCookie(cookies: {
  has(name: string): boolean;
}): boolean {
  return (
    cookies.has(SESSION_COOKIE_NAME) ||
    cookies.has(SESSION_COOKIE_NAME_SECURE)
  );
}

/**
 * Build a safe redirect destination from an untrusted input string.
 *
 * Only allows internal paths (starting with /) to prevent open redirect
 * vulnerabilities. External URLs and protocol-relative paths are rejected.
 */
export function buildSafeReturnUrl(raw: string | null): string | null {
  if (!raw) return null;
  // Must start with / and must not start with // (protocol-relative)
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  // Reject anything that looks like it embeds a protocol after the first slash
  try {
    // Parse as relative URL against a known base to validate structure
    const url = new URL(raw, "https://example.com");
    // Only keep the pathname + search — strip host, protocol, auth
    return url.pathname + (url.search || "");
  } catch {
    return null;
  }
}
