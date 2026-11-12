## Additional Requirement — Next.js 16 Proxy-Based Route Protection

Implement a proper Next.js 16 `proxy.ts` layer for frontend route protection.

### Responsibilities

1. Identify protected application route groups.
2. Identify guest-only routes where appropriate.
3. Check for the presence of the expected Better Auth session cookie.
4. Redirect unauthenticated visitors from protected pages to the appropriate sign-in destination.
5. Preserve the original requested path using a safe return URL.
6. Redirect authenticated visitors away from guest-only routes where appropriate.
7. Avoid redirect loops.
8. Exclude static assets, Next.js internals, images, fonts and unrelated public resources from unnecessary interception.

### Security boundary

The Proxy must not be treated as the authoritative authentication mechanism.

Cookie presence is only an early navigation signal. It does not prove that a session is valid.

Actual session validation must still happen through Better Auth on the server.

All protected Hono API endpoints must independently validate the session and enforce authorization.

Server Components, Server Actions and sensitive data-fetching operations must not trust Proxy execution as proof of authentication.

### Implementation requirements

- Follow the current Next.js 16 `proxy.ts` conventions.
- Inspect the installed Better Auth version to determine the actual session-cookie names and configuration.
- Do not hardcode guessed cookie names.
- Support the configured local and production cookie arrangements.
- Ensure redirects preserve only safe internal return destinations.
- Avoid performing unnecessary database queries for every static or public request.
- Keep the route protection rules centralized and maintainable.
- Add tests for unauthenticated access, authenticated access, expired sessions, guest-only routes, redirect loops and public resources.

Document the route classification strategy so new pages can be added without scattering authentication checks throughout the application.