# EXAMINR — COMPLETE API ENVIRONMENT INITIALIZATION

## Role

You are acting as a senior backend engineer and infrastructure engineer responsible for initializing the backend environment of **Examinr**, an AI-powered examination preparation and personalized learning platform.

Your task is to take the existing Examinr repository and bring its API environment to a fully functional, locally testable, production-conscious state.

This is an implementation task, not a planning exercise.

You have permission to inspect and modify the repository, install the required dependencies, create and update configuration files, implement the API infrastructure, initialize the local database schema, and run verification commands.

Do not merely explain what needs to be done. Actually implement it.

Do not ask me to manually write configuration files or execute steps that you can safely perform yourself. If an operation requires credentials, an external dashboard, or information you cannot access, prepare everything around that limitation and clearly tell me exactly what input or action is required.

---

# 1. PRODUCT CONTEXT

Examinr is a personalized examination preparation platform.

Its initial target market is Nigeria, with support for examinations and curricula such as:

- WAEC
- JAMB / UTME
- NECO
- Other Nigerian secondary-school examinations

The platform may eventually expand to international examination systems.

The platform will provide features such as:

- User accounts and authentication
- Personalized learning experiences
- AI-powered tutoring and explanations
- Practice questions and examinations
- Student performance tracking
- Learning progress and analytics
- Educational resources and materials
- AI-generated study recommendations

Gemini is the initial AI provider.

The API should be structured so that these features can be implemented incrementally without requiring another backend architecture redesign.

Do not attempt to implement the entire product in this task. Your responsibility is to establish a reliable backend foundation.

---

# 2. EXISTING TECHNOLOGY STACK

The project already uses a pnpm and Turborepo monorepo.

The intended stack is:

| Area | Technology |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Web application | Next.js 16 |
| API | Hono |
| API runtime | Cloudflare Workers |
| Database | Cloudflare D1 |
| Application ORM | Drizzle ORM |
| Authentication | Better Auth |
| File storage | UploadThing |
| AI provider | Google Gemini |
| Language | TypeScript |

The repository is located on my Windows machine:

`C:\Users\HP\Desktop\examinr`

Use PowerShell-compatible commands whenever shell commands are necessary.

The repository already contains the following important areas:

- `apps/web`
- `apps/api`
- `packages/db`

The API is currently a minimal Hono application.

The API package previously contained Hono and Wrangler. Better Auth and Drizzle were removed during cleanup, so inspect the actual current dependency state before installing anything.

The existing `packages/db` workspace package is part of the original repository. **Do not delete it, remove it from the workspace, or restructure the monorepo.**

For this implementation, however, the user has explicitly decided that ORM configuration, database access, and authentication should live directly inside `apps/api`, rather than being distributed across shared packages.

Respect that decision.

---

# 3. FIRST: INSPECT THE EXISTING REPOSITORY

Before making changes, inspect:

- Root `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- Root TypeScript configuration
- `apps/api/package.json`
- `apps/api/wrangler.jsonc`
- `apps/api/tsconfig.json`, if present
- All existing files under `apps/api/src`
- Existing API environment files
- `apps/web/package.json`
- Existing web environment configuration
- `packages/db/package.json`
- Existing database-related files and schemas
- Existing `.gitignore` files

Determine the actual state of the repository.

Do not assume that the files match an earlier description.

### Preservation rules

1. Do not overwrite working configuration without inspecting it.
2. Do not replace entire configuration files when a small additive change is sufficient.
3. Preserve existing scripts unless they are genuinely incorrect.
4. Preserve the existing API entry point and its useful functionality.
5. Do not delete original workspace packages.
6. Do not introduce unnecessary abstractions.
7. Do not install duplicate dependencies.
8. Do not add packages merely because they are commonly used in other projects.

Before implementation, produce a concise internal checklist of the changes required. Then proceed with implementation.

---

# 4. ARCHITECTURAL DECISIONS

These decisions are already agreed upon. Do not redesign them without discovering a genuine technical incompatibility.

## 4.1 API

Use Hono running on Cloudflare Workers.

The API should remain a lightweight, modular application.

## 4.2 Database

Use Cloudflare D1 as the primary relational database.

Do not switch to:

- Neon
- PostgreSQL
- Supabase
- PlanetScale
- A local-only SQLite database as the actual application database

Local SQLite files or Wrangler's local D1 emulator may be used for development and testing, but D1 remains the intended database platform.

## 4.3 ORM

Use Drizzle ORM directly inside `apps/api`.

Use its Cloudflare D1 integration.

Drizzle will manage Examinr's application-specific database schemas and queries.

Do not create another shared ORM package.

## 4.4 Authentication

Use Better Auth.

Better Auth must be properly integrated with the Hono API and Cloudflare D1.

**Important architectural preference:**

Prefer Better Auth's supported native Cloudflare D1 database integration, using the D1 binding directly, if it is supported by the installed stable version.

Do not introduce `@better-auth/drizzle-adapter` just because Drizzle is also used by the application.

Authentication and application data access do not need to share an ORM adapter.

Better Auth should own its authentication schema and migrations. Drizzle should own Examinr's application schemas.

If the currently installed Better Auth version does not support the proposed native D1 integration, verify the official documentation and choose the smallest officially supported alternative. Do not improvise unsupported APIs.

## 4.5 Storage

Use UploadThing for file uploads.

Prepare the server-side integration and environment configuration.

Do not implement unnecessary upload features or UI.

## 4.6 AI

Use the Google Gemini API.

Prepare a modular server-side Gemini integration that can be used by future API routes.

Never expose the Gemini API key to the browser.

---

# 5. DEPENDENCY INSTALLATION

Inspect existing dependencies and install only what is required.

The intended API dependencies include:

- `hono`
- `better-auth`
- `drizzle-orm`
- `@hono/cors`, only if necessary
- The official UploadThing server integration required by the chosen integration approach
- The official Google Gemini SDK, if needed

Development dependencies should include only necessary tooling, such as:

- `wrangler`
- `drizzle-kit`
- Existing TypeScript tooling

Use stable, compatible versions.

Do not install experimental or beta packages unless an essential feature requires them.

Do not install:

- Prisma
- A second ORM
- A separate authentication framework
- Unnecessary validation libraries
- Unnecessary dependency injection frameworks
- An alternative database driver intended for PostgreSQL
- Packages that duplicate existing functionality

Use pnpm correctly from the repository root.

Ensure the API package has the dependencies it imports directly. Do not rely on accidental dependency hoisting from the root or another workspace package.

After installation, inspect the resulting package manifests and lockfile.

---

# 6. CLOUDFLARE D1 CONFIGURATION

The Cloudflare D1 database has already been created in my Cloudflare account.

Do not create another database.

However, you do not currently know its actual:

- Database name
- Database ID

Inspect the existing Wrangler configuration first.

Configure the existing `apps/api/wrangler.jsonc` to use the D1 database binding.

The intended binding name is:

`DB`

The API should access the database through the Cloudflare environment binding, not through a hardcoded connection string.

Use the actual D1 database name and ID if they are already present in the repository configuration.

If they are missing:

1. Leave clearly marked placeholders.
2. Complete the rest of the configuration.
3. Do not invent a database ID.
4. Do not attempt to create a replacement database.
5. Tell me exactly which two values I need to supply.

Ensure the Wrangler configuration includes the compatibility settings required by the current Better Auth and Hono integration.

Investigate whether `nodejs_compat` is required by the installed Better Auth version and configure it appropriately.

Preserve existing configuration such as:

- Worker name
- Main entry point
- Compatibility date
- Existing environment definitions
- Existing observability settings
- Existing development configuration

Add only what is necessary.

### D1 requirements

The API must be able to:

- Connect to D1 through the `DB` binding.
- Execute queries.
- Run migrations.
- Verify database connectivity.
- Use the same logical schema locally and remotely.

Do not use hardcoded local database paths in production code.

---

# 7. BETTER AUTH IMPLEMENTATION

This is one of the most important parts of the task.

Implement Better Auth completely.

Do not stop after installing the package.

## 7.1 Authentication configuration

Create a modular authentication configuration inside:

`apps/api/src/auth/`

The implementation should:

- Initialize Better Auth using the D1 database binding.
- Read the Better Auth secret from environment variables.
- Read the API base URL from environment variables.
- Configure trusted origins.
- Enable email and password authentication.
- Use secure cookie/session settings appropriate to the environment.
- Support the web application running separately from the API.
- Be compatible with Hono and Cloudflare Workers.

The initial authentication method is email and password.

Do not integrate an email provider yet.

Do not require email verification at this stage unless Better Auth requires a specific configuration for the intended flow.

Do not implement social login yet.

Do not hardcode secrets or production domains.

## 7.2 Authentication database tables

The Better Auth database schema must actually exist in D1.

At minimum, account for the standard Better Auth tables:

- `user`
- `session`
- `account`
- `verification`

Use the exact schema required by the installed Better Auth version.

Do not manually guess the column definitions.

Use the official Better Auth schema/migration mechanism appropriate to the chosen D1 integration.

If Better Auth provides a supported migration helper for the native D1 integration, use it.

If it provides a CLI-based schema generation process that is genuinely required, configure it correctly and verify its output before using it.

**Do not repeat the previous failed authentication CLI workflow blindly.**

A previous attempt to run Better Auth schema generation failed because the CLI could not resolve its configuration. Do not repeat that same broken approach.

Verify the actual generated schema and migration files.

The result must be reproducible. Authentication tables must not exist only because a developer manually ran an undocumented SQL statement.

## 7.3 Migration strategy

Establish a clear migration strategy.

There must be a distinction between:

- Better Auth's authentication schema migrations
- Drizzle's application schema migrations

Both must target the same D1 database without conflicting with one another.

Ensure that:

- Authentication migrations are repeatable or safely detectable.
- Application migrations are version-controlled.
- Existing tables are not accidentally dropped.
- Migration commands are documented.
- Local and remote migration commands are clearly distinguished.

Do not run destructive migrations against the remote database.

Do not use a temporary public migration endpoint in production.

If a temporary local-only initialization mechanism is required, restrict it to local development, protect it, document it, and remove it once initialization is complete.

## 7.4 Hono integration

Integrate Better Auth with Hono using its officially supported handler pattern.

The API should expose the authentication handler under:

`/api/auth/*`

Ensure CORS middleware is configured before the authentication handler.

Configure credentials support correctly so the web application can authenticate through the API.

Do not use wildcard origins with credentialed requests.

Use environment-specific trusted origins instead of permanently hardcoding localhost.

## 7.5 Session verification

Create a protected endpoint:

`GET /api/me`

It should:

- Read the request headers/cookies.
- Retrieve the current Better Auth session.
- Return the authenticated user when a valid session exists.
- Return HTTP 401 when no valid session exists.

Do not implement a second, independent session system.

Better Auth must remain the authentication authority.

---

# 8. DRIZZLE ORM IMPLEMENTATION

Configure Drizzle directly inside:

`apps/api/src/db/`

Create a clean, minimal structure.

Suggested structure:

`apps/api/src/db/index.ts`

`apps/api/src/db/schema/`

`apps/api/drizzle.config.ts`

You may adjust this structure if the existing repository already has a better convention.

## Requirements

- Use `drizzle-orm/d1`.
- Accept the D1 binding through the Cloudflare environment.
- Export a reusable database initialization function.
- Make the database available to future API handlers.
- Configure Drizzle Kit for SQLite/D1.
- Keep schema definitions in the API application.
- Keep generated application migrations in a dedicated migration directory.

Do not create placeholder business tables simply to demonstrate the ORM.

Do not create a large, speculative database schema for features that have not been implemented.

An empty application schema is acceptable initially.

The first real application tables should be added when the corresponding product features are implemented.

Ensure the ORM can execute a simple test query.

---

# 9. ENVIRONMENT CONFIGURATION

Inspect existing environment files before modifying them.

The API already has local secrets configured, including:

- `BETTER_AUTH_SECRET`
- `UPLOADTHING_TOKEN`
- `GEMINI_API_KEY`

These values are private.

Do not print them in terminal output, logs, reports, or generated documentation.

Do not replace them.

Do not ask me to paste them into the chat or expose them in source files.

The API should support the following environment variables:

| Variable | Purpose |
|---|---|
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | API base URL |
| `WEB_APP_URL` | Trusted web application origin |
| `UPLOADTHING_TOKEN` | UploadThing server credential |
| `GEMINI_API_KEY` | Gemini API credential |

Use the actual environment conventions required by Cloudflare Workers and the existing project.

Preserve `.dev.vars` if it already exists.

Add missing non-secret configuration values without destroying existing secrets.

Ensure:

- `.dev.vars` is ignored by Git.
- `.env` files are not accidentally committed.
- Production secrets are configured through Cloudflare's secret management.
- Public environment variables contain no private credentials.
- No credentials are hardcoded in TypeScript.

If a required secret is missing, report its variable name without printing any other secret values.

---

# 10. UPLOADTHING SERVER INTEGRATION

Prepare UploadThing for future file upload endpoints.

The integration should be modular and live inside:

`apps/api/src/lib/` or another sensible API-local directory.

Requirements:

- Use the supported server-side UploadThing integration.
- Read its credential from `UPLOADTHING_TOKEN`.
- Avoid exposing the token to the client.
- Keep file validation and upload configuration separate from unrelated API handlers.
- Ensure the selected integration is compatible with the Cloudflare Workers runtime.

This is an initialization task, not a complete file-management implementation.

If the official UploadThing integration is not compatible with the current Cloudflare Workers runtime, investigate the officially supported alternative and report the limitation instead of forcing an incompatible package into the project.

Do not silently substitute another storage provider.

---

# 11. GEMINI SERVER INTEGRATION

Prepare a reusable Gemini service inside:

`apps/api/src/lib/ai/` or another appropriate API-local directory.

Requirements:

- Use the official Google Gemini SDK where compatible with Cloudflare Workers.
- Read `GEMINI_API_KEY` from the server environment.
- Never expose the key to the browser.
- Do not instantiate the client unnecessarily on every request.
- Keep the provider implementation separate from future tutoring and learning features.
- Provide a small health/configuration check that confirms whether the AI integration is configured without exposing the key.

Do not create a fake AI response or pretend that a connection has been verified if no real API request was made.

If a real API test would consume credits or require an external request, make that explicit.

Do not hardcode a model name throughout the codebase. Centralize the initial model configuration so it can be changed later.

---

# 12. API STRUCTURE AND ORGANIZATION

Keep the backend organized, but avoid overengineering.

A reasonable starting structure could look like:

```text
apps/
  api/
    src/
      index.ts
      auth/
        auth.ts
      db/
        index.ts
        schema/
          index.ts
      lib/
        ai/
          gemini.ts
        storage/
          uploadthing.ts
      routes/
        health.ts
        me.ts
    drizzle.config.ts
    drizzle/
    wrangler.jsonc
    package.json
    tsconfig.json
    .dev.vars
```

This is a suggestion, not permission to unnecessarily restructure existing code.

Use clear separation of responsibilities:

- `index.ts`: application initialization and middleware.
- `auth/`: Better Auth configuration.
- `db/`: Drizzle database access and application schemas.
- `routes/`: API route handlers.
- `lib/ai/`: Gemini integration.
- `lib/storage/`: UploadThing integration.

Use strict TypeScript.

Avoid `any`.

Prefer explicit interfaces and types for environment bindings.

Avoid excessive abstraction and unnecessary service layers.

---

# 13. INITIAL API ENDPOINTS

Implement the following endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API identification and status |
| GET | `/health` | General API health |
| GET | `/health/db` | D1 connectivity check |
| GET | `/health/auth` | Authentication configuration status, without exposing secrets |
| GET | `/health/ai` | Gemini configuration status |
| ALL | `/api/auth/*` | Better Auth handler |
| GET | `/api/me` | Current authenticated user |

Use appropriate HTTP status codes.

Health endpoints must not leak private environment values, credentials, internal stack traces, or sensitive database information.

Do not return `200 OK` for a dependency that is actually failing.

A health response should clearly distinguish between:

- API process operational
- Database connected
- Authentication initialized
- AI credentials configured

Do not make an external paid AI request just to report whether a key exists.

---

# 14. SECURITY REQUIREMENTS

Implement sensible baseline security.

At minimum:

- Keep secrets server-side.
- Configure CORS with explicit allowed origins.
- Enable credentials only for trusted origins.
- Configure Better Auth trusted origins.
- Use secure cookie settings in production.
- Avoid exposing stack traces to clients.
- Validate incoming request data.
- Avoid logging passwords, tokens, cookies, or API keys.
- Do not expose internal migration endpoints in production.
- Do not create public administrative endpoints.
- Ensure protected routes actually validate sessions.
- Keep local development settings separate from production settings.

Do not claim the API is production-secure merely because authentication works.

Document any remaining production security work.

---

# 15. WEB APPLICATION COMPATIBILITY

The web application runs separately from the API.

The intended local development setup is:

- Next.js web application: `http://localhost:3000`
- Hono API: `http://localhost:8787`

Configure the API so the web application can communicate with it.

If the web application already has an environment variable for its API URL, preserve and reuse it.

Prepare the Better Auth client integration in `apps/web` only if doing so is necessary for verifying the end-to-end authentication flow and the existing frontend structure supports it.

Do not redesign the web application.

Do not replace its authentication UI.

Do not install a second authentication client.

The API must remain the source of truth for authentication.

Document the correct client-side usage for:

- Sign up
- Sign in
- Get session
- Sign out

Ensure cross-origin cookie handling is configured correctly for local development.

Do not assume that cookies work simply because CORS is enabled. Verify the actual behavior.

---

# 16. LOCAL DEVELOPMENT AND STARTUP

The API must be straightforward to run.

Configure the existing scripts rather than creating a complicated command system.

The API should support:

- Development server startup
- Production deployment
- Type generation for Cloudflare bindings
- Database migration generation
- Local D1 migration execution
- Remote D1 migration execution, with explicit safeguards

Use the existing pnpm/Turborepo setup.

Do not introduce Docker.

Do not create an unnecessary shell script framework.

Do not require global installations of extra tools.

The goal is that I can start the API from the repository root using the existing project conventions.

If the root development script already starts both the web and API applications, preserve that behavior.

---

# 17. TESTING AND VERIFICATION

This is mandatory.

Do not finish after writing files.

Run the appropriate checks and fix errors caused by your implementation.

At minimum, verify the following.

## 17.1 Installation

- Dependencies install successfully.
- No invalid workspace dependencies are introduced.
- No duplicate or unnecessary dependencies are installed.

## 17.2 TypeScript

- Generate Cloudflare binding types.
- Run the API type check.
- Resolve implementation-related TypeScript errors.

## 17.3 Wrangler

- Wrangler can load the configuration.
- The API starts locally.
- D1 binding is available.
- No missing binding errors occur.

## 17.4 Database

- The API can execute a query against local D1.
- Drizzle can query the database.
- Better Auth's authentication tables are created.
- The resulting tables match the installed Better Auth version.
- Migrations can be applied without destroying existing data.

## 17.5 Authentication

Test the complete authentication lifecycle:

1. Register a disposable test user.
2. Confirm the user is persisted in D1.
3. Sign in with the test account.
4. Confirm a valid session is created.
5. Call `/api/me` without authentication and confirm HTTP 401.
6. Call `/api/me` with the authenticated session and confirm the user is returned.
7. Sign out.
8. Confirm the session is no longer valid.

Use a temporary test account, not a real user account.

Do not print the test password or session cookie in the final report.

## 17.6 Health endpoints

Verify:

- `/`
- `/health`
- `/health/db`
- `/health/auth`
- `/health/ai`

Distinguish configuration checks from actual external service connectivity tests.

## 17.7 Build and regression checks

Run relevant existing build, lint, and type-check scripts.

Do not make unrelated changes to the web application to get the API working.

Do not conceal existing repository failures. Clearly distinguish pre-existing failures from failures introduced by your changes.

---

# 18. PRODUCTION READINESS

Prepare the API for eventual deployment, but do not deploy it without explicit approval.

Ensure the project has a clear path for:

- Cloudflare Worker deployment
- Production D1 binding
- Remote database migrations
- Production secrets
- Production trusted origins
- Production CORS
- Production Better Auth URL
- Production web application URL

Do not run remote migrations automatically.

Do not create a new Cloudflare database.

Do not publish secrets.

If Cloudflare authentication is unavailable in the environment, complete all local work and leave the deployment configuration ready.

---

# 19. DOCUMENTATION

Update or create an API-specific README:

`apps/api/README.md`

It must explain:

1. API architecture
2. Technology choices
3. Environment variables
4. D1 configuration
5. Better Auth configuration
6. Authentication tables
7. Migration strategy
8. Drizzle usage
9. Local development startup
10. Authentication testing
11. Gemini configuration
12. UploadThing configuration
13. Deployment preparation
14. Known limitations and outstanding manual actions

Also update relevant repository documentation if it already exists.

Do not create duplicate documentation unnecessarily.

Do not put secret values in documentation.

---

# 20. STRICT IMPLEMENTATION RULES

These instructions are important.

### Do not:

- Recreate the repository.
- Replace the monorepo architecture.
- Delete `packages/db`.
- Move the ORM or authentication into shared packages.
- Switch away from Cloudflare D1.
- Switch away from Better Auth.
- Switch away from Hono.
- Introduce Prisma.
- Introduce PostgreSQL.
- Install unnecessary libraries.
- Run the previous failed Better Auth CLI command without fixing its underlying configuration issue.
- Invent the D1 database name or ID.
- Hardcode secrets.
- expose secrets in logs.
- Run destructive database operations.
- Deploy to production without permission.
- Claim a test passed when it was not run.
- Leave temporary migration routes or debugging endpoints exposed.
- Create placeholder implementations that pretend to work.

### Do:

- Inspect before editing.
- Reuse existing configuration.
- Use official, current documentation.
- Check compatibility between package versions.
- Keep the implementation minimal and modular.
- Use strict TypeScript.
- Run actual verification commands.
- Fix errors introduced by your changes.
- Document anything that still requires manual intervention.
- Preserve existing project functionality.

If documentation or package APIs have changed, prioritize the current official documentation for the exact installed versions over old examples or assumptions.

---

# 21. DEFINITION OF DONE

The task is complete only when the following are true:

- [ ] API dependencies are installed correctly.
- [ ] Hono runs on Cloudflare Workers.
- [ ] Wrangler configuration is valid.
- [ ] D1 binding is configured.
- [ ] Local D1 connectivity works.
- [ ] Drizzle is initialized inside `apps/api`.
- [ ] Better Auth is initialized inside `apps/api`.
- [ ] Better Auth's authentication schema has been created in D1.
- [ ] Authentication migrations are reproducible.
- [ ] Email/password registration works.
- [ ] Email/password login works.
- [ ] Session retrieval works.
- [ ] Protected API routes work.
- [ ] Logout works.
- [ ] CORS and trusted origins are configured.
- [ ] Gemini integration is prepared.
- [ ] UploadThing integration is prepared.
- [ ] Environment secrets remain private.
- [ ] Health endpoints work.
- [ ] TypeScript checks pass.
- [ ] Existing relevant build checks pass.
- [ ] API documentation is updated.
- [ ] No temporary development-only endpoint remains exposed.
- [ ] No production deployment or destructive remote database operation has occurred.

If any item cannot be completed because of missing external access, credentials, or configuration, complete everything else and report the exact blocker.

---

# 22. FINAL REPORT

When finished, provide a concise but thorough implementation report.

Use these sections:

## A. What was implemented
List the actual backend components and configuration files created or modified.

## B. Authentication
Explain how Better Auth is connected to D1, which authentication tables exist, how migrations work, and which authentication flows were tested.

## C. Database
Explain the Drizzle setup and D1 connection.

## D. Integrations
Report the status of Gemini and UploadThing separately.

## E. Verification
List the commands actually executed and their results.

Use explicit statuses:

- PASS
- PARTIAL
- BLOCKED
- NOT TESTED

Never claim a test passed unless you executed it successfully.

## F. Remaining manual actions
List only actions that genuinely require my intervention, such as supplying the existing D1 database ID or authenticating with Cloudflare.

## G. How to start the API
Give me the exact command to start the API from the repository root.

## H. Next recommended step
Recommend the most sensible next backend implementation step after the environment is initialized.

---

# FINAL INSTRUCTION

Take ownership of the initialization process.

Inspect the existing Examinr repository, implement the backend environment, initialize the database and authentication schema, run the tests, fix implementation errors, and document the result.

I want a working API foundation, not a collection of suggested files or theoretical instructions.

Preserve the existing project and its decisions.

Start by inspecting the repository, then proceed systematically until the definition of done is satisfied or a genuine external blocker prevents further progress.