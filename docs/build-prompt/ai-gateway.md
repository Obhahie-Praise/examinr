# Kiro CLI Implementation Brief: Examinr AI Gateway & Multimodal Credential Router

## 1. Mission

You are working inside the existing Examinr monorepo.

Your task is to design, implement, test and document a production-minded **AI Gateway and Multimodal Credential Router** for Examinr.

This is a core backend infrastructure feature. Treat it as such.

The gateway must allow Examinr to dynamically manage a growing pool of AI provider credentials, automatically distribute requests across eligible credentials, handle provider failures, securely store credentials, and support multiple AI interaction modalities.

The initial provider is Google Gemini.

The architecture must be extensible enough to accommodate additional providers such as OpenAI and Anthropic later, without requiring the entire gateway to be rewritten.

Do not build a throwaway implementation. Do not implement only a basic API proxy. Do not declare the task complete simply because the endpoints and dashboard render.

The implementation must be functional, tested, secure and integrated with Examinr's existing architecture.

---

# 2. Mandatory working process

Before writing code, understand the repository.

### Step 1: Inspect the existing project

Start by examining:

- Root repository structure.
- Root `package.json` and `pnpm-workspace.yaml`.
- `turbo.json`.
- Existing `apps/api` structure.
- Existing `apps/web` structure.
- Existing Hono application and route organization.
- Existing Cloudflare Worker configuration.
- Existing D1 bindings and database setup.
- Existing Drizzle configuration and schema organization.
- Existing Better Auth configuration and authorization mechanisms.
- Existing admin dashboard implementation.
- Existing frontend design system and component conventions.
- Existing UploadThing integration.
- Existing environment variable and secret-management conventions.
- Existing test infrastructure.
- Existing documentation and progress tracker.

Read applicable `AGENTS.md`, `README.md`, architecture documentation, contributor instructions and existing implementation plans.

Identify the current state of the API foundation before changing anything.

The API has previously been established as a Hono application running on Cloudflare Workers. D1, Drizzle and Better Auth are part of the intended foundation. Verify their actual current implementation rather than assuming it is complete.

### Important repository constraints

- Preserve the existing pnpm/Turborepo architecture.
- Preserve existing workspace packages, including `packages/db`.
- Do not delete or replace existing packages simply because you prefer another structure.
- Keep implementation-specific dependencies in the appropriate existing package.
- Avoid unnecessary dependencies and abstractions.
- Use strict TypeScript.
- Avoid `any`.
- Reuse existing authentication, database, UI and utility infrastructure.
- Do not introduce another authentication system.
- Do not unnecessarily restructure the repository.
- Do not replace working implementations without a technical reason.
- Do not overwrite existing documentation blindly.

The existing `.dev.vars` may contain sensitive environment variables. Preserve it. Never print, expose, copy into documentation or commit secret values.

The D1 database has already been created, but its exact name and identifier must be discovered from the current configuration. Never invent these values.

### Step 2: Establish an implementation plan

Before substantial implementation:

1. Summarize the current architecture.
2. Identify existing reusable components.
3. Identify missing infrastructure.
4. Identify files that will need modification or creation.
5. Identify migration requirements.
6. Define the testing strategy.
7. Record the implementation plan in the repository's existing documentation location, if appropriate.

Do not create duplicate documentation or progress trackers.

If the repository already has a progress tracker, update that tracker. If it does not, inspect the documentation structure and establish one appropriate tracker.

### Step 3: Implement incrementally

Implement the feature in logical phases.

After each phase:

- Run the relevant tests.
- Run applicable type checks.
- Resolve errors before moving on.
- Update the existing progress tracker.
- Record completed work, outstanding work and verification evidence.

Do not mark a phase complete simply because its files have been created.

---

# 3. Product vision and non-negotiable requirements

The Examinr AI Gateway is a central infrastructure service through which all Examinr AI functionality should eventually operate.

Its primary purpose is to increase Examinr's usable AI capacity over time by allowing the super administrator to add more provider credentials dynamically.

The administrator should not need to modify code, environment variables, deployment configuration or database records manually whenever a new credential is added.

The intended experience is:

1. Open the Examinr super-admin dashboard.
2. Navigate to AI Gateway.
3. Click Add API Key.
4. Enter a credential name.
5. Enter the API key.
6. Save.

That is the entire credential-registration workflow.

The administrator may eventually have 5, 20, 50, 100 or more credentials, potentially originating from different Google accounts and Google Cloud projects.

**The application must not require the administrator to register or manage Google accounts, Google Cloud projects, billing accounts, project IDs, quota groups or project relationships.**

Those details are outside the product's administrative workflow.

The gateway manages a flat, dynamically expandable credential pool.

Internally, it manages credential health, availability, routing, retries, usage and failure information.

The dashboard should not expose unnecessary Google infrastructure concepts.

### Critical distinction

A credential is not necessarily an independent quota pool.

Multiple API keys can belong to the same Google Cloud project and therefore share project-level quota.

The router must not assume that every credential represents independent quota.

However, the administrator should not be required to identify or configure these relationships.

The system must operate safely with incomplete quota-domain knowledge.

If shared-project relationships can be established reliably through supported provider information, the gateway may use them internally. Otherwise, it must rely on observed credential and provider behaviour.

Never invent project relationships or claim that adding keys guarantees additional quota.

The objective is to maximize legitimate available provider capacity, not bypass provider restrictions.

---

# 4. Core architecture

Build the AI Gateway as a modular TypeScript subsystem inside the existing API application.

The exact directory structure should follow existing repository conventions, but the responsibilities should be separated.

The architecture should contain the following logical components.

## 4.1 Credential Manager

Responsible for:

- Adding credentials.
- Encrypting credentials.
- Retrieving credentials.
- Decrypting credentials when needed.
- Updating credential names.
- Enabling and disabling credentials.
- Removing credentials.
- Tracking credential health.
- Tracking last-used timestamps.
- Tracking last successful use.
- Tracking recent errors.
- Tracking cooldown periods.
- Maintaining credential metadata.

The credential manager must not expose decrypted credentials to the frontend.

## 4.2 Credential Router

Responsible for selecting credentials for outgoing requests.

It must:

- Discover eligible credentials dynamically.
- Exclude disabled credentials.
- Exclude credentials in cooldown.
- Avoid credentials marked invalid.
- Distribute requests across healthy credentials.
- Avoid repeatedly selecting the same failing credential.
- Handle concurrent requests safely within the limitations of the chosen infrastructure.
- Respect model and modality compatibility.
- Support future weighted routing without requiring a redesign.

Use a sensible initial strategy such as healthy-first least-recently-used selection or controlled round-robin.

Do not claim globally strict round-robin behaviour if the underlying Cloudflare execution model cannot guarantee it.

Do not rely exclusively on Worker isolate memory for authoritative routing state.

## 4.3 Failure and Recovery Engine

Responsible for:

- Credential failover.
- Retry decisions.
- Exponential backoff where appropriate.
- Cooldown management.
- Provider error classification.
- Timeout handling.
- Circuit-breaker behaviour.
- Recovery probing.

The gateway should distinguish:

- Invalid or revoked credentials.
- Authentication failures.
- Permission failures.
- Model availability errors.
- Request validation errors.
- Rate-limit errors.
- Daily quota exhaustion.
- Billing or account restrictions.
- Temporary provider outages.
- Network errors.
- Timeouts.

Do not classify every HTTP 403 as an invalid API key.

Do not permanently disable a credential because of a temporary model or billing problem.

A confirmed invalid credential may be marked unavailable or disabled automatically, but the administrator must retain visibility and control.

### Quota-aware behaviour

When a credential receives a quota-exceeded response:

1. Inspect the provider response and Retry-After information where available.
2. Put the credential into an appropriate cooldown.
3. Attempt another eligible credential within a bounded retry budget.
4. Track repeated quota failures across different credentials.
5. If many credentials fail similarly, recognize that they may share a quota domain or that the provider has a broader restriction.
6. Avoid endlessly cycling through the entire credential pool.
7. Apply an appropriate provider/model-level cooldown or controlled fallback when necessary.

Since the administrator does not provide project associations, the implementation must not depend on manual quota-group configuration.

Where shared quota cannot be determined, use conservative behaviour based on observed failures.

## 4.4 Model Registry

Maintain an internal registry of supported models and their capabilities.

The registry must distinguish capabilities such as:

- Text input.
- Text output.
- Image input.
- Image generation.
- Audio input.
- Audio output.
- Real-time audio interaction.
- Streaming responses.
- Structured output.
- Function/tool calling.

Do not assume every Gemini model supports every capability.

The router must select a model compatible with the requested operation.

Keep model configuration centralized instead of scattering model names throughout application features.

## 4.5 Usage and Monitoring Manager

Track operational information such as:

- Total AI requests.
- Successful requests.
- Failed requests.
- Requests by provider.
- Requests by model.
- Requests by modality.
- Credential usage.
- Token consumption where returned.
- Audio usage and session duration where available.
- Request latency.
- Retry counts.
- Rate-limit failures.
- Cooldown events.
- Provider error categories.

Never store raw API credentials in logs.

Do not store complete prompts or uploaded user content in usage records by default.

Only calculate estimated costs when reliable current pricing information is available. Never invent token costs.

---

# 5. Credential storage and security

This is one of the most important parts of the implementation.

All provider credentials must be stored securely.

## 5.1 Database storage

Use the existing D1 database and Drizzle infrastructure.

Create the necessary migrations and schema using the project's established conventions.

A credential record should contain appropriate metadata, such as:

- ID.
- Provider identifier.
- Display name.
- Encrypted credential value.
- Encryption initialization vector.
- Encryption key version.
- Non-sensitive credential fingerprint or masked identifier.
- Status.
- Created timestamp.
- Updated timestamp.
- Last-used timestamp.
- Last-successful-use timestamp.
- Last-error category.
- Cooldown expiration.
- Optional internal routing metadata.

The Gemini administrator interface should only require a name and API key.

Do not introduce project IDs, Google account IDs, quota-group selectors or billing configuration fields into the Gemini credential form.

Provider identity may be assigned internally. Since Gemini is the initial provider, the first implementation can default to Gemini.

## 5.2 Encryption

Use the Web Crypto API available in Cloudflare Workers.

Implement authenticated encryption using AES-256-GCM.

Requirements:

- Generate a unique cryptographically secure IV for each encryption operation.
- Store the ciphertext and IV separately.
- Keep the encryption master key outside D1.
- Store the master key as a Cloudflare Worker secret.
- Use an explicit encryption key version.
- Fail closed if the encryption secret is unavailable.
- Never fall back to plaintext storage.
- Never return decrypted credentials from API responses.
- Never log decrypted credentials.
- Never expose credentials to browser-side JavaScript.

Use an appropriate secret name such as:

`AI_CREDENTIAL_ENCRYPTION_KEY`

The exact secret setup procedure must be documented.

Do not put the secret value in `wrangler.jsonc`, `.env.example`, source code or Git.

Document how to generate and configure the secret securely.

Implement a clear strategy for future encryption-key rotation.

A database dump without the external encryption secret must not reveal provider credentials.

## 5.3 Credential management API

Create authenticated administrative endpoints following existing API conventions.

Required operations:

- List credentials.
- Add a credential.
- Update its display name.
- Enable a credential.
- Disable a credential.
- Delete a credential.
- Optionally test a credential.

The list endpoint must return safe metadata only.

Example response:

```json
{
  "id": "credential-id",
  "name": "Gemini Account 01",
  "provider": "gemini",
  "status": "active",
  "maskedKey": "••••••••1234",
  "lastUsedAt": "timestamp",
  "lastSuccessfulUseAt": "timestamp"
}
```

This is illustrative. Follow the project's actual response conventions.

The original API key must never be returned after it has been saved.

Credential creation should not require a separate Google project-management workflow.

Credential validation must distinguish a confirmed invalid credential from temporary provider failures. Saving a credential should not silently fail just because Google's API is temporarily unavailable.

If a validation call is implemented, make its behaviour and possible provider usage clear.

---

# 6. Super-admin authorization

Only the Examinr super administrator should manage AI credentials.

Inspect the existing Better Auth configuration and role/permission implementation first.

Reuse the existing authorization system.

Do not build a second authentication system.

All credential-management endpoints must enforce authorization server-side.

Hiding the dashboard page or navigation item is not sufficient.

Requirements:

- Super-admin can access AI credential management.
- Ordinary users cannot access it.
- Other administrators cannot access it unless they are explicitly authorized as super-admin under the existing role model.
- Unauthorized API requests must fail even when called directly.
- Credential data must never be returned to ordinary user sessions.

Use the project's established error response and authorization conventions.

Add automated authorization tests.

---

# 7. AI Gateway public/internal interface

All Examinr AI features should eventually use a central gateway rather than making direct provider calls.

Design a clean, strongly typed internal interface.

An illustrative usage pattern:

```ts
const result = await ai.generate({
  task: "explain-question",
  model: "gemini-flash",
  input: {
    text: "Explain Newton's second law",
  },
});
```

The actual implementation should follow existing naming and conventions.

The important requirement is that application features should not need to know which credential is being used.

They should not need to retrieve API keys.

They should not implement credential rotation.

They should not implement provider failover themselves.

The gateway owns those responsibilities.

Build appropriate interfaces for:

- Standard generation.
- Multimodal generation.
- Streaming generation.
- Live-session provisioning.

Use a provider abstraction that allows future providers to implement the same capability contracts.

However, do not waste time implementing OpenAI or Anthropic integrations in this task.

Gemini is the initial fully implemented provider.

---

# 8. Multimodal support

This gateway is not a text-only service.

Its architecture must support text, image, audio and real-time voice interactions.

Implement the relevant interfaces and Gemini integration using currently supported official APIs.

## 8.1 Text

Support:

- Question explanations.
- Tutoring.
- Question generation.
- Summarization.
- Study assistance.
- Structured output.
- Streaming text responses where appropriate.

## 8.2 Image understanding

Support image input for educational workflows.

Examples:

- A student uploads a photograph of a mathematics question.
- A student uploads handwritten workings.
- A student uploads a physics diagram.
- A student uploads a chemistry structure.
- A student uploads a chart or graph.

The gateway should be able to send text and image content together to a compatible Gemini model.

Integrate with the existing upload infrastructure where appropriate.

Inspect the existing UploadThing implementation before introducing another file-storage system.

Do not store large image payloads directly in D1.

Implement appropriate file validation, size limits and safe content handling.

Distinguish image understanding from image generation in the model capability registry.

## 8.3 Audio

Establish support for audio input and output.

Potential operations include:

- Audio transcription.
- Audio understanding.
- Speech-based tutoring.
- Spoken AI responses.

Use models and endpoints that officially support the requested operation.

Do not assume that every Gemini model supports audio input or output.

## 8.4 Real-time voice interaction

Support the architecture for bidirectional real-time voice conversations between a student and Examiner.

Use Google's current Gemini Live API documentation.

Implement a dedicated Live Session Manager.

The expected flow is:

1. Student authenticates with Examinr.
2. Examinr checks the student's permissions and AI usage allowance.
3. The gateway selects an eligible Gemini credential.
4. The backend provisions a restricted, short-lived ephemeral token where supported.
5. The browser receives only the ephemeral token and required session configuration.
6. The browser establishes its real-time WebSocket connection.
7. The student and Examiner communicate bidirectionally.

**Never send a permanent Gemini API key to the browser.**

Do not proxy every audio packet through the Hono Worker if the supported Live API architecture allows a secure direct client-to-provider WebSocket connection.

The gateway should control session creation, authentication, model selection, credential allocation and usage tracking.

Implement sensible controls for:

- Session expiration.
- Token lifetime.
- Session creation limits.
- User authorization.
- Credential availability.
- Usage accounting.
- Failed session provisioning.

Do not persist ephemeral tokens in D1 or logs.

If the current Gemini Live API requires preview-specific behaviour or has limitations, document them accurately.

Do not pretend that a normal text-generation endpoint provides real-time voice functionality.

---

# 9. Routing behaviour and failure handling

Implement a predictable and testable routing strategy.

Suggested initial behaviour:

1. Retrieve eligible Gemini credentials.
2. Exclude disabled or invalid credentials.
3. Exclude credentials currently cooling down.
4. Select a healthy credential using least-recently-used or another justified strategy.
5. Decrypt only the selected credential.
6. Make the provider request.
7. Record the result.
8. Update health and usage metadata.
9. Retry through another eligible credential only when appropriate.

### Error behaviour

| Situation | Expected behaviour |
|---|---|
| Invalid credential | Mark unavailable and try another |
| Rate limit | Cool down credential and try another |
| Repeated shared quota failures | Avoid endless credential rotation |
| Temporary 5xx | Bounded retry with backoff |
| Timeout | Retry only when safe |
| Unsupported model | Return a meaningful model error |
| Invalid request | Return validation error without unnecessary retries |
| All credentials unavailable | Return controlled service-unavailable response |
| Gemini-wide outage | Return controlled error; keep provider abstraction ready for future failover |

Streaming requires special handling.

Once response bytes have been sent to the client, transparent failover may no longer be possible.

Only perform transparent retries before streaming begins. Handle interruptions after streaming begins explicitly.

Never retry indefinitely.

Use request identifiers and structured error categories to make failures diagnosable without exposing sensitive data.

---

# 10. Separate provider capacity from product usage allowances

Do not confuse provider quotas with Examinr's own product limits.

These are separate systems.

Provider capacity represents how much AI usage Examinr can currently obtain from its providers.

Product allowances represent how much AI usage a student is permitted to consume.

The gateway should provide an appropriate integration point for Examinr's usage and subscription rules.

Do not hardcode arbitrary user limits into the credential router.

Do not make credential availability dependent on a student's subscription tier.

Keep provider routing and user entitlement enforcement logically separate.

---

# 11. Super-admin dashboard

Integrate the AI Gateway into the existing super-admin dashboard.

Inspect the current dashboard, navigation, components and visual conventions before implementation.

Do not redesign unrelated sections.

The UI should feel native to Examinr.

## AI Gateway management screen

At minimum, provide:

### Credential overview

Show:

- Total credentials.
- Active credentials.
- Disabled credentials.
- Unavailable credentials.
- Credentials currently in cooldown.
- Recent request success/failure information.

### Add credential

The Gemini credential form should contain exactly the essential fields:

- Credential name.
- API key.

A simple Save action.

Do not ask for Google account details, Google Cloud project IDs, billing accounts or quota-group configuration.

### Credential list

Show:

- Name.
- Masked key.
- Provider.
- Status.
- Last used.
- Last successful use.
- Recent error/health information.

Provide appropriate actions:

- Enable.
- Disable.
- Rename.
- Delete.
- Test connection, if supported.

Require confirmation before deletion.

Never show the original API key after saving.

### Usage and health overview

Show useful operational metrics without overwhelming the interface.

The dashboard should communicate whether the gateway is healthy and whether requests are being successfully routed.

Avoid fake metrics and placeholder charts presented as real data.

---

# 12. Database design

Use the existing D1 and Drizzle setup.

Design the minimum normalized schema necessary for:

- AI credentials.
- AI request usage.
- AI route/failure events.
- Optional internal model configuration.
- Optional live-session metadata.

Keep credential records separate from usage events.

Do not store raw credentials in usage records.

Do not store sensitive prompts or user-uploaded content by default.

Add indexes for common lookup patterns, especially credential status, cooldown state, last-used ordering and usage reporting.

Use appropriate constraints and timestamps.

Follow existing migration conventions.

Do not perform destructive production migrations or deploy to production as part of this task.

Use local D1 migrations and local test data where possible.

If a remote operation is genuinely required, document it and request approval before performing it.

---

# 13. Cloudflare-specific engineering requirements

The API runs on Cloudflare Workers.

Do not write code that assumes a conventional long-running Node.js server.

Use supported Worker APIs and bindings.

Important considerations:

- Use the Web Crypto API for encryption.
- Use the existing D1 binding.
- Use fetch-compatible provider integrations.
- Respect Worker execution and request limits.
- Avoid filesystem dependencies at runtime.
- Avoid unsupported Node.js APIs.
- Avoid long-lived in-memory state as the authoritative source of credential health.
- Avoid unnecessary Durable Objects in the initial implementation.

If strict global coordination or high-concurrency quota allocation later requires Durable Objects, document the reason and design the extension point. Do not introduce distributed infrastructure prematurely.

Do not assume Cloudflare's approximate Rate Limiting binding provides strict globally coordinated quota enforcement.

For any strict per-credential upstream quota enforcement, choose an appropriate coordination strategy and explain its trade-offs.

---

# 14. Testing requirements

Testing is mandatory.

Do not declare this task complete without running the tests.

Use the existing test framework where available. If none exists, introduce the smallest suitable testing setup compatible with the repository.

Do not use real production credentials in automated tests.

Use mocked provider responses and deterministic test fixtures.

## 14.1 Encryption tests

Test:

- Successful encryption and decryption.
- Different IVs for separate encryption operations.
- Incorrect encryption key.
- Modified ciphertext.
- Modified IV.
- Missing encryption secret.
- Key-version handling.
- No plaintext credential leakage in returned objects.

## 14.2 Credential management tests

Test:

- Add credential.
- List credentials.
- Rename credential.
- Disable credential.
- Enable credential.
- Delete credential.
- Duplicate or malformed input handling.
- Encrypted database storage.
- Masked key responses.
- Unauthorized access.
- Super-admin access.

Verify that a normal user cannot access credential-management endpoints.

## 14.3 Router tests

Test:

- Multiple eligible credentials.
- Dynamic credential discovery.
- Healthy credential selection.
- Rotation or least-recently-used behaviour.
- Disabled credential exclusion.
- Cooldown exclusion.
- Invalid credential handling.
- Rate-limit failover.
- Temporary server errors.
- Timeout behaviour.
- Bounded retry limits.
- All credentials unavailable.
- Concurrent request behaviour.
- Repeated 429 responses across credentials.
- No endless retry loops.

Include a test demonstrating why multiple keys from a shared quota domain must not be assumed to represent independent quota.

The router must remain functional without manually configured project associations.

## 14.4 Multimodal tests

Test:

- Text request routing.
- Text plus image input.
- Unsupported modality/model combinations.
- Audio input routing where supported.
- Audio output routing where supported.
- Streaming response handling.
- Live session provisioning.
- Expired ephemeral token behaviour.
- Unauthorized live session creation.
- No permanent API key exposure in browser-facing responses.

Use mocked provider responses where live provider access is unavailable.

## 14.5 Integration tests

Test the actual Hono routes and relevant services together.

Verify:

- D1 interactions.
- Better Auth authorization.
- Credential encryption.
- Gateway routing.
- Error responses.
- Usage event recording.
- Live session provisioning.

Do not rely exclusively on unit tests.

---

# 15. Documentation

Update the repository's existing documentation.

Create or update an AI Gateway technical document explaining:

- Architecture.
- Component responsibilities.
- Database schema.
- Credential encryption.
- Secret setup.
- Credential management endpoints.
- Super-admin authorization.
- Routing strategy.
- Error classification.
- Retry and cooldown behaviour.
- Multimodal support.
- Gemini Live API session flow.
- Testing instructions.
- Local development.
- Migration instructions.
- Known limitations.
- Future extension points.

Document all required environment variables by name, never by secret value.

Include the command needed to configure the encryption secret using Wrangler.

Document any required D1 migration commands using the actual repository configuration.

Do not invent database names or identifiers.

Keep documentation practical and aligned with the implementation.

---

# 16. Progress tracker requirements

The existing progress tracker is part of the deliverable.

Find and inspect the current progress tracker before making changes.

Do not create a second tracker if one already exists.

Update it throughout implementation, not only at the end.

Track at least these milestones:

1. Repository inspection and architecture plan.
2. Credential database schema and migrations.
3. Credential encryption and storage.
4. Super-admin credential management API.
5. Super-admin dashboard integration.
6. Gemini provider adapter.
7. Credential routing and selection.
8. Failure handling, retries and cooldowns.
9. Usage tracking and monitoring.
10. Image and audio request support.
11. Gemini Live session provisioning.
12. Automated tests.
13. Documentation.
14. Final verification.

For every milestone, record:

- Status.
- What was implemented.
- Files or areas changed.
- Tests performed.
- Test results.
- Outstanding issues.

Use the existing tracker's format.

Do not mark unfinished or untested work as complete.

---

# 17. Implementation boundaries

This task is about building the gateway and its administrative infrastructure.

Do not attempt to rebuild all of Examinr's AI-powered product features.

Do not rewrite the tutoring system, question generator or examination engine unnecessarily.

Instead:

- Build the central gateway.
- Establish clean interfaces.
- Integrate a small representative AI feature or test route to prove the gateway works.
- Document how existing and future AI features should use it.
- Identify any existing direct Gemini calls that should eventually be migrated, but avoid risky unrelated rewrites.

Do not implement OpenAI or Anthropic provider integrations yet.

Do not implement a Google Cloud project-management interface.

Do not add manual quota-group management.

Do not expose Google account relationships.

Do not build a complicated credential configuration wizard.

Do not create arbitrary hardcoded limits on the number of credentials.

Do not promise unlimited quota.

Do not introduce unnecessary infrastructure.

Do not deploy to production without explicit approval.

---

# 18. Current provider documentation

Before implementing the Gemini adapter, verify the current official documentation.

Use current documentation rather than relying on outdated examples or deprecated SDKs.

Relevant references:

- Gemini API documentation: https://ai.google.dev/gemini-api/docs
- Gemini API key documentation: https://ai.google.dev/gemini-api/docs/api-key
- Gemini rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini image understanding: https://ai.google.dev/gemini-api/docs/image-understanding
- Gemini audio: https://ai.google.dev/gemini-api/docs/audio
- Gemini Live API: https://ai.google.dev/gemini-api/docs/live
- Gemini Live ephemeral tokens: https://ai.google.dev/gemini-api/docs/live/ephemeral-tokens
- Cloudflare Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/

Verify the currently supported authentication format and key restrictions.

Do not blindly assume that old unrestricted standard Gemini API keys remain accepted. Google has changed its API-key security requirements. Support the currently documented credential types and clearly report incompatible credentials.

Verify the current official JavaScript SDK and its compatibility with Cloudflare Workers before selecting it.

Avoid deprecated Gemini SDKs.

---

# 19. Definition of done

This task is complete only when all applicable conditions below have been satisfied.

### Repository and architecture

- [ ] Existing repository structure was inspected.
- [ ] Existing working infrastructure was preserved.
- [ ] Architecture follows current project conventions.
- [ ] Gateway responsibilities are modular and clearly separated.

### Credential security

- [ ] Super-admin can add Gemini credentials using only a name and API key.
- [ ] Credentials are encrypted before database storage.
- [ ] Encryption secret is stored outside D1.
- [ ] Credentials are never returned in plaintext.
- [ ] Ordinary users cannot manage or retrieve credentials.
- [ ] Credential management operations are tested.

### Routing

- [ ] Router discovers credentials dynamically.
- [ ] Requests are distributed across eligible credentials.
- [ ] Disabled and unavailable credentials are excluded.
- [ ] Cooldowns work.
- [ ] Failover works.
- [ ] Retries are bounded.
- [ ] Shared quota ambiguity is handled conservatively.
- [ ] All-unavailable behaviour is controlled.

### Multimodal support

- [ ] Text requests work.
- [ ] Image inputs are supported.
- [ ] Audio interfaces are established and supported operations are implemented.
- [ ] Live session provisioning is implemented using the currently supported Gemini mechanism.
- [ ] Permanent API keys are never exposed to the browser.
- [ ] Capability-aware model selection works.

### Dashboard

- [ ] AI Gateway is integrated into the existing super-admin dashboard.
- [ ] Credential registration remains simple.
- [ ] Credential status and health are visible.
- [ ] Sensitive values remain masked.
- [ ] No unnecessary Google project-management workflow exists.

### Verification

- [ ] Automated tests pass.
- [ ] Type checking passes.
- [ ] Relevant linting passes.
- [ ] Production build passes where applicable.
- [ ] Local D1 migrations have been tested.
- [ ] No secrets were committed or exposed.
- [ ] Documentation is updated.
- [ ] Progress tracker is updated with actual evidence.

---

# 20. Final report

When finished, provide a concise but technically meaningful implementation report.

Include:

1. What was implemented.
2. Architectural decisions made.
3. Important files created or modified.
4. Database migrations added.
5. Environment secrets that I must configure.
6. Commands I need to run manually.
7. Tests actually executed and their results.
8. Features that are fully working.
9. Features that remain incomplete or require external configuration.
10. Known limitations.
11. Progress tracker location and updated status.

Distinguish between:

- Implemented and tested.
- Implemented but not fully tested.
- Documented but not implemented.
- Blocked by missing external configuration.

Never claim a feature works merely because its code exists.

If a test fails, report it and investigate it rather than hiding it.

If a required credential, Cloudflare configuration or external permission is missing, identify exactly what is missing and give me the necessary next step.

**The final objective is a secure, expandable, multimodal AI Gateway that allows Examinr to grow its available AI capacity simply by adding credentials through the super-admin dashboard, while the system independently handles routing, credential security, health monitoring, failover and provider integration.**