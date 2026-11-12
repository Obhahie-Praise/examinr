# Kiro CLI Implementation Brief: Examinr Authentication, Drizzle ORM & Web Styling Foundation

## 1. Mission

Implement the next foundational layer of Examinr in the existing repository:

1. Set up **Better Auth** as the authentication system.
2. Integrate Better Auth with **Drizzle ORM and the existing Cloudflare D1 database**.
3. Connect the Next.js web application to the authentication API.
4. Install and configure **Tailwind CSS** in `apps/web`.
5. Make **DM Sans** the application's primary font using Next.js font optimization.
6. Migrate existing application-authored styling to Tailwind CSS without redesigning the existing UI.

This is an integration and foundation task, not a product redesign.

**Explicitly excluded: onboarding.** Do not implement onboarding screens, onboarding steps, profile setup flows, student questionnaires, or onboarding state management. That work will happen after authentication and styling are ready.

---

## 2. Non-negotiable project preservation rules

Before changing anything, inspect the actual repository and its current Git state.

Repository:

`C:\Users\HP\Desktop\examinr`

This is a pnpm/Turborepo monorepo. The known architecture includes:

- `apps/web`: Next.js application.
- `apps/api`: Hono API running on Cloudflare Workers.
- `packages/db`: existing database package using Drizzle ORM.
- Cloudflare D1 as the existing application database.
- Better Auth is not yet considered implemented merely because documentation or dependencies mention it.
- The AI Gateway and its credential-management dashboard have recently been implemented.

These are starting points, not permission to assume the current files still match previous descriptions.

### Preserve the existing AI Gateway

The AI Gateway implementation is already committed to the cloud repository.

Do not:

- Remove or replace the AI Gateway.
- Rewrite its credential-management system.
- Remove the API-key management dashboard.
- Rebuild its existing UI.
- Change its encryption or credential-storage architecture without a demonstrated requirement.
- Break existing AI routes or provider functionality.
- Introduce a separate database for authentication.

The existing AI API-key management dashboard must remain in the application. It can be redesigned later.

### Preserve existing project architecture

Do not:

- Replace the monorepo.
- Replace Hono with another API framework.
- Replace D1.
- Replace Drizzle.
- Introduce Prisma.
- Duplicate the database package.
- Create a second authentication service.
- Add unnecessary dependencies.
- Change unrelated application features.

Inspect `AGENTS.md`, `README.md`, `docs/`, package manifests, workspace configuration, existing progress documentation, and relevant implementation files before planning changes.

Check the Git status and do not overwrite unrelated uncommitted changes.

---

## 3. Mandatory initial repository audit

Before implementation, inspect:

### Monorepo

- Root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- Root TypeScript configuration
- Existing package manager and Node.js requirements
- Existing scripts and dependency versions

### API

Inspect:

- `apps/api/package.json`
- Hono entry point
- Worker configuration
- Cloudflare bindings and environment types
- Existing middleware
- Existing API route registration
- Existing D1 binding
- Existing Drizzle initialization
- Existing AI Gateway modules
- Existing error-handling conventions
- Existing CORS configuration

### Database

Inspect:

- `packages/db/package.json`
- Existing Drizzle schema files
- Drizzle configuration
- Existing migrations
- D1 database configuration
- Existing database initialization and exports
- Existing naming conventions and table relationships

### Web application

Inspect:

- `apps/web/package.json`
- Next.js version and router structure
- Root layout
- Existing global stylesheets
- Existing CSS modules
- Existing component styling
- Existing route structure
- Existing API client
- Existing environment variables
- Existing font configuration
- Existing dashboard and AI credential-management pages

### Documentation

Read:

- `docs/PROGRESS.md`
- `docs/ROADMAP.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE.md`
- Any existing authentication documentation
- Any relevant AI Gateway documentation

Identify which features are actually implemented versus merely documented.

Produce a short implementation plan before editing files.

---

# PART A — BETTER AUTHENTICATION

## 4. Authentication architecture

Use Better Auth as the authentication system.

The intended architecture is:

```text
Next.js Web Application
        |
        | Authentication requests
        v
Hono API — Cloudflare Worker
        |
        v
Better Auth
        |
        v
Drizzle ORM
        |
        v
Existing Cloudflare D1 Database
```

The web application must not connect directly to D1.

The API remains responsible for authentication, session validation, authorization, and protected application endpoints.

Use the official Better Auth documentation:

- https://better-auth.com/docs/installation
- https://better-auth.com/docs/adapters/drizzle
- https://better-auth.com/docs/integrations/hono
- https://better-auth.com/docs/guides/cloudflare

Verify the current API and configuration requirements before implementation.

## 5. Better Auth installation and configuration

Install compatible versions of:

- `better-auth`
- `@better-auth/drizzle-adapter`

Install them in the appropriate workspace package.

Use the existing package manager and workspace conventions.

Do not blindly install dependencies into the monorepo root if the API package is the correct owner.

Configure Better Auth with the existing Drizzle database instance.

The Drizzle adapter must use the SQLite provider because the database is Cloudflare D1.

Conceptually:

```ts
database: drizzleAdapter(db, {
  provider: "sqlite",
})
```

This is an architectural illustration, not a requirement to copy the snippet without adapting it to the actual repository.

### Cloudflare-specific requirements

Better Auth must work correctly in the Cloudflare Workers runtime.

Inspect the existing Worker compatibility date and configuration.

Verify whether `nodejs_compat` is required by the installed Better Auth version and current Cloudflare runtime requirements.

Do not assume Node.js APIs, process environment variables, or database drivers work identically in local Node.js and Cloudflare Workers.

In particular:

- Use the existing D1 binding.
- Use the appropriate Drizzle D1 driver.
- Ensure authentication initialization has access to the current request's Worker environment.
- Do not create a module-level database connection that cannot access the correct request-scoped D1 binding.
- Do not create a new SQLite file or local-only database.
- Ensure the same authentication configuration is used consistently across API routes and session validation.
- Keep secrets in Worker secrets or local development variables.
- Never expose authentication secrets to the browser.

If the existing API architecture requires a request-scoped Better Auth instance, implement a clean factory or equivalent pattern.

Avoid unnecessary repeated initialization where a safe reusable design is possible.

## 6. Authentication methods

For the initial implementation, configure:

- Email and password authentication.
- User registration.
- User sign-in.
- User sign-out.
- Session retrieval.
- Session validation.
- Session expiration and refresh behaviour supported by Better Auth.

Do not add Google, GitHub, Apple, or other social login providers.

Do not add passkeys, magic links, or phone-number authentication.

Do not pretend email verification is functional without a configured email delivery system. If email verification is required by the chosen configuration, document the missing email provider and do not create a fake verification flow.

Use secure password handling provided by Better Auth. Never implement password hashing manually.

Configure reasonable password requirements and rate limiting using supported Better Auth capabilities.

Avoid storing unnecessary personal information.

## 7. Authentication schema and Drizzle integration

Use Better Auth's supported Drizzle adapter.

Generate or implement the required authentication schema using the current official Better Auth schema-generation guidance.

Required core models will generally include:

- User
- Session
- Account
- Verification

Inspect the current Better Auth schema requirements and installed version before deciding the exact fields.

Important:

- Use the existing database package.
- Keep schema definitions in the appropriate database package.
- Do not duplicate existing user or authentication tables.
- Do not create conflicting model names.
- Preserve existing application tables.
- Ensure all Better Auth models are correctly passed to the Drizzle adapter.
- Use the correct SQLite column types and timestamp modes.
- Ensure migrations are compatible with Cloudflare D1.

If Better Auth requires additional fields or tables, document why they are required.

### Migration requirements

Create proper Drizzle migrations.

Do not directly mutate the production database.

Do not use destructive migrations.

Do not reset the existing D1 database.

Do not delete existing tables or data.

Inspect generated SQL before applying it.

Ensure local development migrations can be applied through the existing project workflow.

Document the exact command for applying migrations to the intended remote environment, but do not execute a production migration or deployment without explicit approval.

## 8. Hono authentication routes

Mount Better Auth in the existing Hono API.

The expected route prefix is:

`/api/auth/*`

Use the official Hono integration pattern:

```ts
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));
```

Adapt this to the existing API base path and route registration order.

Ensure the route does not get intercepted by a catch-all handler.

Register authentication routes in a way that does not interfere with existing AI Gateway routes.

### Session middleware

Implement reusable authentication middleware for protected API endpoints.

It should:

1. Read the request headers.
2. Retrieve and validate the Better Auth session.
3. Reject unauthenticated requests with HTTP 401.
4. Make the authenticated user and session available to downstream handlers.
5. Preserve the existing API error-handling conventions.

Use the actual inferred Better Auth session types.

Do not use `any`.

Do not trust user IDs supplied in request bodies when a session can provide the authenticated user ID.

Do not treat the existence of a cookie as sufficient proof of a valid session for sensitive server-side operations.

## 9. Authorization and super-administrator protection

The existing AI credential-management dashboard must remain.

However, it must ultimately be protected by real authentication and server-side authorization.

Inspect the existing AI Gateway authorization implementation before changing it.

Determine how the current system identifies the super administrator.

If an authorization mechanism already exists, integrate Better Auth sessions into it rather than replacing it.

If no secure user-role mechanism exists:

- Establish a clear default user role.
- Establish a secure super-administrator assignment mechanism.
- Never allow public registration to grant administrator privileges.
- Never accept an administrator role from an untrusted client request.
- Never rely on hiding dashboard navigation as authorization.
- Validate administrator permissions on every protected API operation.

An environment-controlled administrator allowlist may be used for initial bootstrap if it fits the current architecture, but it must be evaluated carefully and documented.

Do not silently introduce a new administrator account, hardcode an email address, or grant administrator permissions to every user.

The existing AI credential management API must reject ordinary authenticated users.

Test both authorized and unauthorized access.

## 10. CORS, cookies and frontend/backend origins

Inspect the actual local and deployed origins before configuring CORS.

The web application and API may run on different hosts.

Configure:

- Explicit trusted origins.
- Credentials-enabled CORS where cross-origin requests require it.
- Secure cookie settings in production.
- Appropriate local development cookie settings.
- Correct cookie path and domain behaviour.
- CSRF/origin protection supported by Better Auth.

Never use a wildcard CORS origin together with credentialed authentication.

Do not guess the production domain.

### Important deployment consideration

If the web application is hosted on Vercel and the API on a separate `workers.dev` domain, investigate browser third-party cookie restrictions.

Do not assume cross-site cookies will behave reliably.

Evaluate the safest supported approach:

1. A same-origin web proxy or rewrite for authentication requests, or
2. A suitable shared custom-domain arrangement.

Choose based on the existing deployment configuration.

If a proxy is used, preserve request bodies, cookies, headers, response status, and `Set-Cookie` headers correctly.

Do not expose Better Auth secrets or permanent API credentials in the Next.js bundle.

Document the final origin and cookie architecture.

---

# PART B — FRONTEND AUTHENTICATION INTEGRATION

## 11. Better Auth client

Set up the official Better Auth client for the existing Next.js application.

Use the appropriate React integration.

Create a clean reusable authentication client module.

Expose only the functionality needed by the web application, such as:

- Sign-in
- Sign-up
- Sign-out
- Session retrieval
- Session state

Use the correct API base URL or same-origin proxy arrangement established in the previous section.

Configure credentials correctly.

Ensure TypeScript types are preserved.

Do not duplicate authentication logic across components.

## 12. Session access and protected routes

Create reusable session utilities and, where appropriate, a lightweight authentication provider.

The application should be able to determine:

- Whether a user is authenticated.
- The authenticated user's identity.
- Whether the session is loading.
- Whether the session has expired.
- Whether an authenticated user has administrator permissions.

Protect sensitive routes and API operations server-side.

For Next.js 16, inspect whether the project uses `proxy.ts` or another routing strategy.

Do not assume older `middleware.ts` examples are the correct convention for this repository.

Use server-side session validation for sensitive pages and actions.

A client-side route guard may improve user experience, but it must never replace server-side authorization.

### Scope boundary

Do not build a complete authentication experience or onboarding flow in this task.

Implement the authentication infrastructure and reusable client integration.

If the repository already contains sign-in or registration screens, connect them to Better Auth without unnecessarily redesigning them.

If there are no such screens, do not invent an onboarding or login UI just to demonstrate the backend.

Provide an appropriate test path for authentication without introducing permanent placeholder pages.

---

# PART C — TAILWIND CSS

## 13. Install Tailwind CSS in `apps/web`

The Next.js web application must use Tailwind CSS.

Inspect the existing Next.js version and current PostCSS setup.

Prefer the current Tailwind CSS v4 integration if it is compatible with the existing project.

Official reference:

https://tailwindcss.com/docs/installation/framework-guides/nextjs

For the current v4 PostCSS approach, the expected dependencies are:

- `tailwindcss`
- `@tailwindcss/postcss`
- `postcss`

Install them in the appropriate workspace package.

Configure the PostCSS plugin correctly.

Import Tailwind in the application's global stylesheet:

```css
@import "tailwindcss";
```

Adapt this to the existing stylesheet structure.

Do not blindly follow Tailwind v3 tutorials or run obsolete initialization commands.

If the current project has a compatibility constraint that requires Tailwind v3, explain the constraint and use the correct v3 configuration instead of forcing v4.

## 14. Tailwind migration requirements

The goal is to use Tailwind utilities for application-authored styling throughout `apps/web`.

Migrate:

- Page layouts.
- Component layouts.
- Spacing.
- Typography.
- Colours.
- Borders.
- Backgrounds.
- Shadows.
- Responsive behaviour.
- Flex and grid layouts.
- Hover, focus and active states.
- Component sizing.
- Existing responsive breakpoints.

Inspect all existing styles before migrating.

### Native CSS restriction

Do not continue building application components with:

- CSS modules.
- Component-specific `.css` files.
- Inline style objects for ordinary visual styling.
- Large custom CSS selectors.
- Handwritten responsive CSS.

Use Tailwind classes instead.

The minimal global stylesheet is allowed for:

- Tailwind's import.
- Global theme tokens.
- Font variable integration.
- Minimal base styles and resets that are genuinely global.
- Styling that cannot reasonably be expressed with Tailwind utilities.

Do not attempt to remove every CSS file blindly. Preserve stylesheets required by libraries or external integrations until they are safely migrated.

If a third-party component requires CSS, document why it remains.

Do not replace Tailwind with another styling framework.

### Preserve the existing design

This is not a redesign.

Keep existing:

- Layouts.
- Component hierarchy.
- Visual identity.
- Colours.
- Spacing relationships.
- Responsive behaviour.
- Dashboard structure.
- AI credential-management dashboard.

Translate the current visual implementation into Tailwind without inventing a new design language.

Do not add unnecessary component libraries.

Do not install shadcn/ui unless the repository already uses it or a concrete requirement justifies it.

## 15. Tailwind theme configuration

Create a clean and maintainable theme foundation.

Use Tailwind v4's supported CSS-first configuration where appropriate.

Define reusable tokens for existing application colours and design values.

Keep the theme minimal.

Do not invent a new Examinr brand palette.

Ensure the design tokens are easy to extend later.

---

# PART D — DM SANS FONT

## 16. Set DM Sans as the global primary font

Use Next.js's built-in Google Fonts integration:

`next/font/google`

Official documentation:

https://nextjs.org/docs/app/getting-started/fonts

Use `DM_Sans` and configure it in the root application layout.

Requirements:

- Latin subset.
- Appropriate font weights or variable-font configuration.
- `display: "swap"`.
- Global application-wide usage.
- A CSS variable if that integrates cleanly with the Tailwind theme.

Do not load DM Sans through a remote CSS `@import`.

Do not add an unnecessary Google Fonts package.

Next.js downloads and self-hosts Google Font files during the build process. This means the browser does not need to request the font directly from Google.

Use the font consistently across the entire web application.

Make DM Sans the default font for:

- Body text.
- Headings.
- Buttons.
- Inputs.
- Navigation.
- Dashboard content.
- Authentication-related components.

Preserve appropriate font weights and hierarchy.

Do not introduce a second font unless a genuine existing requirement calls for it.

---

# PART E — INTEGRATION AND TESTING

## 17. Authentication tests

Test the actual implementation, not just TypeScript compilation.

At minimum, cover:

### Registration

- Valid registration succeeds.
- Invalid email is rejected.
- Invalid password is rejected.
- Duplicate email registration is rejected.
- Passwords are not stored as plaintext.
- User role defaults to a non-admin role.

### Login

- Correct credentials succeed.
- Incorrect credentials fail.
- Unknown accounts fail safely.
- Session cookies are issued correctly.
- Session retrieval returns the expected user.

### Session lifecycle

- Authenticated session can be retrieved.
- Sign-out invalidates the session.
- Expired or invalid sessions are rejected.
- Protected routes reject unauthenticated requests.

### Authorization

- Normal users cannot access super-admin routes.
- Normal users cannot create AI credentials.
- Normal users cannot update or delete AI credentials.
- An authorized super administrator can access permitted management operations.
- Client-side manipulation cannot bypass server-side authorization.

### Database

- Better Auth tables are represented in Drizzle.
- Migrations generate successfully.
- Local D1 migrations apply successfully.
- Existing application tables remain intact.
- Existing AI Gateway data remains intact.
- Authentication queries work using the actual D1-compatible Drizzle driver.

### Browser integration

Verify:

- Registration request.
- Login request.
- Session persistence.
- Session retrieval after page refresh.
- Logout.
- Cookie behaviour.
- CORS behaviour if cross-origin.
- Correct handling of unauthenticated requests.

Do not claim authentication is complete if only unit tests pass.

## 18. Tailwind and font tests

Verify:

- Tailwind CSS compiles.
- Tailwind utilities render correctly.
- Responsive utilities work.
- Global styles are not conflicting.
- DM Sans is loaded successfully.
- The browser uses DM Sans as its primary font.
- No unexpected font requests are made to Google at runtime.
- Existing pages render correctly.
- The AI credential-management dashboard still works and looks consistent with its previous design.

Inspect the application at desktop and mobile widths.

Check for layout regressions.

## 19. Monorepo verification

Run the existing project checks using the repository's actual scripts.

At minimum, where scripts exist:

- Dependency installation.
- TypeScript checks.
- Lint.
- Tests.
- API build.
- Web build.
- Relevant Drizzle schema or migration checks.

Do not invent scripts and claim they passed.

Fix errors introduced by this task.

Do not silently suppress existing errors.

If unrelated pre-existing failures prevent a check from passing, document them separately.

---

# PART F — DOCUMENTATION AND PROGRESS TRACKING

## 20. Documentation updates

Update relevant repository documentation.

Document:

- Authentication architecture.
- Better Auth configuration.
- Drizzle integration.
- Authentication schema.
- D1 migration workflow.
- Local environment variables.
- Required Cloudflare Worker secrets.
- Trusted origins.
- Cookie and CORS architecture.
- Super-administrator bootstrap procedure.
- Authentication client usage.
- Protected API route usage.
- Tailwind configuration.
- DM Sans integration.
- Development and verification commands.

Do not write secrets into documentation.

Do not include actual API keys or authentication secret values.

Keep implementation-specific documentation in the repository.

## 21. Progress tracker updates

The existing `docs/PROGRESS.md` is the authoritative repository progress tracker.

Update it as work proceeds.

Do not wait until the end.

Use meaningful milestones:

1. Repository audit completed.
2. Better Auth configuration implemented.
3. Drizzle authentication schema integrated.
4. D1 migration generated and locally validated.
5. Hono authentication routes implemented.
6. Session middleware and authorization implemented.
7. Web authentication client integrated.
8. Tailwind CSS installed and configured.
9. DM Sans integrated globally.
10. Existing web styling migrated.
11. Tests and builds completed.
12. Documentation updated.

Only mark a milestone complete when there is evidence.

Record failed checks, unresolved issues, and blockers honestly.

Do not mark remote deployment or production migrations complete unless they were explicitly authorized and successfully verified.

---

# PART G — IMPLEMENTATION ORDER

## 22. Recommended phases

### Phase 0 — Audit

Inspect the repository, current dependencies, database architecture, AI Gateway, frontend and progress tracker.

Deliver a concise plan.

### Phase 1 — Database and Better Auth

- Install compatible dependencies.
- Integrate Drizzle.
- Configure Better Auth.
- Generate the authentication schema.
- Create and inspect migrations.
- Validate local D1 migration behaviour.

### Phase 2 — API authentication

- Mount Better Auth in Hono.
- Configure trusted origins and cookies.
- Add session middleware.
- Add server-side authorization.
- Secure existing super-admin credential-management endpoints.

### Phase 3 — Frontend integration

- Create the Better Auth client.
- Integrate session access.
- Implement reusable auth utilities.
- Verify authentication requests and session persistence.

Do not build onboarding.

### Phase 4 — Tailwind CSS

- Install Tailwind.
- Configure PostCSS.
- Configure theme tokens.
- Migrate existing application styling.
- Preserve existing appearance and responsive behaviour.

### Phase 5 — DM Sans

- Configure `next/font/google`.
- Apply DM Sans globally.
- Integrate it with the Tailwind theme.

### Phase 6 — Verification

- Run tests.
- Run type checks.
- Run lint.
- Run builds.
- Test authentication and authorization.
- Inspect the web application visually.
- Verify the AI Gateway dashboard remains functional.

### Phase 7 — Documentation and progress

- Update relevant documentation.
- Update `docs/PROGRESS.md`.
- Provide a final implementation report.

---

# PART H — STRICT IMPLEMENTATION BOUNDARIES

## 23. Do not implement these features

Explicitly excluded:

- Onboarding.
- Student profile setup.
- Student questionnaires.
- Academic goal selection.
- Student dashboards beyond existing functionality.
- AI tutoring features.
- Exam practice features.
- New AI Gateway functionality.
- Social authentication providers.
- Email delivery infrastructure.
- Unrequested UI redesign.
- Unrequested component libraries.
- Production deployment.
- Production database migrations.

Do not add placeholder onboarding screens.

Do not add a fake login page simply to demonstrate authentication if the existing application does not need one yet.

## 24. Environment and secret handling

Inspect the existing environment configuration without printing secret values.

Preserve existing variables.

Identify which new variables are required.

For each new secret, document:

- Name.
- Purpose.
- Where it must be configured.
- Whether it is needed locally, remotely, or both.

Never expose secrets in:

- Browser bundles.
- Client-side environment variables.
- Logs.
- Screenshots.
- Documentation.
- Git commits.

Do not ask the user to paste secret values into the conversation.

Do not generate fake production credentials.

## 25. Dependency discipline

Use pnpm.

Inspect existing dependency versions before installing anything.

Avoid unnecessary upgrades.

Do not upgrade Next.js, Hono, Drizzle, Wrangler, or Better Auth merely because newer versions exist.

Use compatible versions and explain any required version changes.

Preserve the existing workspace lockfile integrity.

Do not use `npm install` inside the pnpm workspace.

---

# PART I — DEFINITION OF DONE

The task is complete only when all applicable conditions below are satisfied.

### Authentication

- [ ] Better Auth is configured.
- [ ] Drizzle ORM adapter is connected.
- [ ] Existing D1 database is used.
- [ ] Authentication schema is integrated.
- [ ] Migrations are generated and locally validated.
- [ ] Hono authentication routes work.
- [ ] Registration works.
- [ ] Sign-in works.
- [ ] Sign-out works.
- [ ] Sessions persist and validate correctly.
- [ ] Protected routes reject unauthenticated users.
- [ ] Super-admin operations have server-side authorization.
- [ ] Ordinary users cannot manage AI credentials.
- [ ] Cookie, CORS and trusted-origin configuration is correct.

### Web foundation

- [ ] Tailwind CSS is installed.
- [ ] Tailwind compiles successfully.
- [ ] Existing styling is migrated to Tailwind.
- [ ] DM Sans is configured globally.
- [ ] Existing visual appearance is preserved.
- [ ] Responsive layouts work.
- [ ] No unnecessary CSS modules or component-specific styles remain.

### Preservation

- [ ] AI Gateway remains intact.
- [ ] AI credential-management dashboard remains intact.
- [ ] Existing D1 data is preserved.
- [ ] Existing API routes continue working.
- [ ] No unrelated features were rebuilt.
- [ ] No onboarding was implemented.

### Quality

- [ ] Relevant tests pass.
- [ ] TypeScript checks pass.
- [ ] Lint passes.
- [ ] API build passes.
- [ ] Web build passes.
- [ ] Documentation is updated.
- [ ] `docs/PROGRESS.md` reflects verified progress.

---

# PART J — FINAL REPORT

When finished, provide a concise but technical implementation report containing:

1. **Repository audit:** What was already present and what was missing.
2. **Architecture:** How Better Auth, Drizzle, D1, Hono and Next.js connect.
3. **Authentication:** What functionality is implemented.
4. **Authorization:** How super-administrator access is enforced.
5. **Styling:** How Tailwind and DM Sans were integrated.
6. **Files changed:** Important files and their purposes.
7. **Dependencies:** What was added and why.
8. **Migrations:** What was generated and whether local migration validation passed.
9. **Tests:** Exact commands run and their actual results.
10. **Builds:** Exact results for API and web builds.
11. **Progress tracker:** Which milestones were updated.
12. **Environment setup:** New variables and required manual configuration, without exposing values.
13. **Outstanding work:** Anything incomplete or blocked.
14. **Next milestone:** What should be tackled after this foundation.

Do not claim success based on generated code alone.

Do not claim remote authentication is working if only local tests were performed.

Do not claim a migration was applied remotely if it was only generated.

Do not mark the task complete while critical authentication or authorization tests are failing.

**Final instruction:** Work carefully, inspect first, preserve existing work, implement in phases, test what you build, and keep the progress tracker accurate. The goal is a stable authentication and styling foundation for Examinr — not a premature implementation of the onboarding experience.