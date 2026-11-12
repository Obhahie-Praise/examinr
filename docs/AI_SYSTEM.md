# AI System

## 1. Purpose

Examinr uses an internal AI gateway to power its intelligent learning features.

The gateway provides one controlled interface between the application and external AI providers. It manages provider credentials, model selection, request routing, usage tracking, fallbacks, and operational controls.

The application must not communicate directly with AI providers from individual features. All AI requests should pass through the internal gateway.

The gateway should be provider-agnostic while preserving access to useful provider-specific capabilities.

## 2. Core Principles

- **Centralised access:** All application AI requests pass through the gateway.
- **Configurable routing:** Models and providers can be changed without rewriting individual features.
- **Provider independence:** Examinr should not depend entirely on one AI provider.
- **Cost awareness:** Usage and estimated costs must be measurable.
- **Security:** Provider credentials and sensitive student data must remain protected.
- **Reliability:** Timeouts, controlled retries, and fallbacks should prevent unnecessary disruption.
- **Educational accuracy:** AI-generated explanations, questions, and evaluations must be treated as potentially fallible.
- **Observability:** Administrators should understand how AI services are performing.

## 3. System Architecture

The AI system consists of the following components:

| Component | Responsibility |
|---|---|
| AI Gateway | Receives and coordinates application AI requests |
| Request Validator | Validates incoming requests and their parameters |
| Task Classifier | Identifies the type of AI operation required |
| Model Router | Selects an appropriate model based on configured rules |
| Provider Registry | Maintains supported provider integrations |
| Credential Manager | Securely stores and retrieves provider credentials |
| Provider Adapters | Communicate with individual AI provider APIs |
| Response Processor | Normalises provider responses and errors |
| Usage Tracker | Records usage, latency, estimated cost, and request status |
| Admin Controls | Allows authorised administrators to manage AI infrastructure |

### Request flow

1. An application feature sends a request to the internal AI gateway.
2. The gateway authenticates the request and validates its payload.
3. The task classifier identifies the requested operation.
4. The model router selects an enabled route and model.
5. The gateway retrieves the appropriate provider credential.
6. The provider adapter sends the request to the external provider.
7. The response processor handles the result.
8. Usage and operational information are recorded.
9. The result is returned to the requesting application feature.

## 4. AI Task Categories

AI requests should be organised by application purpose rather than having individual features select model names.

Initial task categories:

| Task | Purpose |
|---|---|
| `tutor_explanation` | Explain concepts and answer learning questions |
| `question_generation` | Generate practice and examination questions |
| `answer_evaluation` | Evaluate student answers and provide feedback |
| `performance_analysis` | Analyse student performance and identify weaknesses |
| `study_recommendation` | Recommend topics and learning activities |
| `content_simplification` | Rewrite difficult concepts into accessible explanations |
| `general_assistance` | Handle other approved learning-related requests |

These categories are an initial routing taxonomy, not a permanent list. New task types can be introduced when the product requires them.

Each task should have a defined input contract, output contract, validation rules, and expected behaviour.

## 5. Provider and Model Management

### Provider registry

A provider represents an external AI service integrated into Examinr.

The registry should support:

- Provider identification and display name.
- Provider API configuration.
- Enabled or disabled status.
- Supported capabilities.
- Available credentials.
- Supported models.
- Connection and health status.
- Provider-specific configuration.

Initial integration priority is Google Gemini, with the architecture allowing additional providers later.

### Model registry

A model is a specific model offered by a provider.

Model records should contain:

- Provider relationship.
- Model identifier used by the provider API.
- Display name.
- Supported capabilities.
- Input and output constraints where known.
- Availability status.
- Configurable parameters.
- Pricing configuration for cost estimation.
- Administrative notes.

Model identifiers and pricing must be configurable. Avoid scattering model names or pricing assumptions throughout application code.

A model must always belong to a registered provider. A provider credential and a model are separate entities.

## 6. Credential Management

Examinr should support multiple credentials for a provider.

For example, administrators may configure multiple Google Gemini API credentials for different projects or operational requirements.

Credential management should support:

- Adding credentials.
- Editing credential metadata.
- Enabling and disabling credentials.
- Testing credentials.
- Assigning credentials to provider integrations.
- Tracking credential health.
- Rotating and replacing credentials.
- Viewing masked credential identifiers.
- Auditing credential changes.

### Security requirements

Raw API keys must never be returned to the browser after submission.

Credentials must:

- Be encrypted at rest using authenticated encryption.
- Be decrypted only within trusted server-side execution.
- Never appear in application logs, error messages, or analytics.
- Be masked in administrative interfaces.
- Be accessible only to authorised server-side gateway operations.
- Have encryption key versions recorded to support future key rotation.

The master encryption secret should be stored as a Cloudflare Worker Secret, not in source code or the database.

Credential records should store encrypted data and the metadata required for secure decryption, including the encryption version and required nonce or authentication data.

### Important quota consideration

Multiple API keys do not automatically multiply available API quota.

Rate limits may apply at the project, organisation, account, or provider level. Examinr must respect the provider's actual quota rules.

Credential selection should support legitimate operational needs such as project separation, credential health, and configured routing. It must not rotate credentials to evade provider rate limits or usage restrictions.

## 7. Model Routing

The model router decides which model should handle each request.

Application features should request a task category, not a hardcoded provider or model.

For example:

- A simple concept explanation may use a fast, cost-efficient model.
- A complex tutoring request may use a model with stronger reasoning capabilities.
- Question generation may use a model configured for structured output.
- Performance analysis may use a model suited to interpreting structured student data.

These are routing examples, not fixed model assignments.

### Route configuration

An AI route should support:

- Task category.
- Primary provider.
- Primary model.
- Fallback provider and model, where appropriate.
- Enabled or disabled status.
- Request parameters.
- Output constraints.
- Timeout configuration.
- Usage limits.
- Routing priority.
- Administrative description.

Routes must be configurable without modifying application feature code.

### Fallback behaviour

Fallbacks should only be used when the configured alternative can satisfy the original task's requirements.

The gateway should:

- Record when a fallback occurs.
- Preserve the original task requirements.
- Avoid silently changing output expectations.
- Avoid retrying requests that could create duplicate side effects.
- Return a clear failure when no suitable route is available.

## 8. Provider Adapters

Each provider should have its own adapter.

Adapters are responsible for:

- Authentication with the provider.
- Request formatting.
- Response parsing.
- Streaming support where available.
- Error normalisation.
- Provider-specific parameter handling.
- Token and usage metadata extraction where available.

The gateway should expose a consistent internal interface without forcing every provider into an unnecessarily restrictive common feature set.

Provider-specific functionality can remain available through explicit capabilities.

Adding a new provider should primarily require implementing its adapter and registering its supported models.

## 9. Application Integration

Application features should communicate with the gateway through typed internal interfaces.

Shared contracts should define:

- Task identifiers.
- Input schemas.
- Output schemas.
- Request metadata.
- Streaming event formats.
- Error structures.

Zod should validate incoming data and important structured AI outputs.

The gateway should enforce:

- Authentication.
- Authorisation.
- Request validation.
- Rate limits.
- Usage limits.
- Input size limits.
- Timeouts.
- Appropriate error handling.

### Streaming

The gateway should support streaming responses for features that benefit from progressive output, particularly AI tutoring.

Streaming should preserve a consistent event format for the frontend regardless of the underlying provider.

The initial implementation should use the existing API infrastructure and HTTP streaming capabilities where suitable.

## 10. Educational AI Behaviour

AI features must be designed around learning outcomes rather than simply generating text.

### Tutoring

The tutor should:

- Explain concepts clearly.
- Adjust explanations to the student's level.
- Use examples where useful.
- Encourage understanding rather than simply providing answers.
- Distinguish established facts from uncertainty.
- Avoid inventing syllabus requirements or examination rules.

### Question generation

Generated questions should:

- Follow the requested examination and subject context.
- Match the selected topic and difficulty.
- Use valid question structures.
- Include answer keys and explanations where required.
- Pass structural validation.
- Be reviewed or verified before entering trusted question-bank content.

AI-generated questions must not automatically become verified examination content.

### Answer evaluation

Evaluation should:

- Follow the relevant marking criteria.
- Accept valid alternative answers where appropriate.
- Provide explanations for incorrect answers.
- Distinguish objective marking from subjective judgement.
- Avoid presenting uncertain assessments as definitive.

### Performance analysis

Analysis should use actual student performance records supplied through authorised application services.

The AI must not invent performance history, claim progress that has not been recorded, or treat limited practice data as conclusive evidence.

### Student context

Only the student information required for a particular task should be included in the AI request.

Sensitive information must not be sent unnecessarily.

## 11. Usage Tracking and Cost Management

Every AI request should produce a usage record.

Where available, record:

- User ID.
- Task category.
- Provider.
- Model.
- Credential reference, without the raw credential.
- Input token count.
- Output token count.
- Total token count.
- Estimated cost.
- Request duration.
- Request status.
- Fallback status.
- Timestamp.
- Relevant request identifier.

Usage records should support:

- Total platform usage.
- Usage by provider.
- Usage by model.
- Usage by task.
- Usage by user.
- Usage by institution where applicable.
- Estimated expenditure.
- Failed requests.
- Average response latency.
- Usage trends over time.

Pricing should be configurable and versioned. Estimated costs must not be represented as exact provider invoices.

The system should handle providers that do not expose complete token or cost information.

### Usage limits

The gateway should eventually support configurable limits at different levels:

- Platform-wide limits.
- Provider limits.
- Model limits.
- Task-specific limits.
- User limits.
- Institution limits.

Limits should be enforced server-side, not only through frontend restrictions.

## 12. Admin AI Dashboard

AI infrastructure should be manageable from a protected administrative interface.

### Overview

Display:

- Overall AI service status.
- Request volume.
- Success and failure rates.
- Token consumption.
- Estimated expenditure.
- Average latency.
- Provider availability.
- Recent operational issues.

### Providers

Administrators should be able to:

- View registered providers.
- Add supported providers.
- Enable or disable providers.
- Configure provider settings.
- Inspect provider health.

### Credentials

Administrators should be able to:

- Add credentials.
- Test credentials.
- Enable or disable credentials.
- Replace credentials.
- View masked identifiers.
- Inspect health and usage metadata.

Raw credentials must never be displayed again after submission.

### Models

Administrators should be able to:

- Register models.
- Configure model identifiers.
- Assign models to providers.
- Configure capabilities.
- Set pricing metadata.
- Enable or disable models.

### Routing

Administrators should be able to:

- View task routes.
- Assign primary models.
- Configure fallbacks.
- Adjust route parameters.
- Enable or disable routes.
- Inspect routing behaviour.

### Usage and logs

Administrators should be able to inspect:

- Request history.
- Provider and model usage.
- Token consumption.
- Estimated costs.
- Failures and error categories.
- Latency.
- Fallback events.

Logs must not expose API keys, sensitive student information, or unnecessary prompt and response content.

## 13. Reliability and Performance

The gateway should implement:

- Configurable request timeouts.
- Controlled retries with backoff.
- Provider health monitoring.
- Concurrency controls.
- Rate limiting.
- Graceful handling of unavailable providers.
- Structured error reporting.
- Request correlation IDs.
- Appropriate streaming cancellation handling.

Retries should be limited to transient failures and operations that are safe to retry.

Do not retry indefinitely.

Caching may be used for safe, reusable content, but private student-specific responses must not be placed in shared caches.

The gateway should not become a single point of failure that prevents students from accessing non-AI examination and practice features.

## 14. Security and Privacy

The AI system must follow Examinr's wider security and privacy requirements.

- Only authenticated and authorised services can make protected AI requests.
- Provider credentials remain server-side.
- Student data is minimised before being sent to providers.
- Administrative actions require appropriate permissions.
- Credential and routing changes must be audited.
- Request logs must avoid unnecessary personal information.
- Provider errors must not expose secrets.
- AI outputs must be validated before being used in trusted application operations.
- Usage records must follow the platform's retention policies.

The gateway must never allow a student to select arbitrary provider credentials, bypass configured routes, or access administrative AI operations.

## 15. Suggested Package Structure

The following is the intended logical structure for the AI package. It does not require every file to be created immediately.

```text
packages/ai/
├── src/
│   ├── gateway/
│   │   ├── index.ts
│   │   ├── request.ts
│   │   └── response.ts
│   ├── routing/
│   │   ├── router.ts
│   │   ├── registry.ts
│   │   └── types.ts
│   ├── providers/
│   │   ├── provider.interface.ts
│   │   ├── gemini/
│   │   └── index.ts
│   ├── credentials/
│   │   ├── encryption.ts
│   │   └── manager.ts
│   ├── tasks/
│   │   ├── tutor.ts
│   │   ├── question-generation.ts
│   │   ├── evaluation.ts
│   │   └── analysis.ts
│   ├── usage/
│   │   ├── tracker.ts
│   │   └── pricing.ts
│   ├── validation/
│   ├── errors/
│   └── index.ts
├── package.json
└── tsconfig.json
```

The package should expose a clear public interface. Internal provider implementation details should not leak into application features.

The exact structure may evolve as implementation reveals better boundaries.

## 16. Implementation Priorities

Implement the AI system incrementally.

### Phase 1: Gateway foundation

- Establish the internal gateway interface.
- Implement request and response contracts.
- Add request validation.
- Integrate the first provider.
- Add basic error handling.
- Connect one application feature.

### Phase 2: Model management

- Implement provider and model registries.
- Add configurable task routing.
- Add model configuration.
- Introduce controlled fallback behaviour.

### Phase 3: Credential management

- Support multiple credentials.
- Implement server-side encryption and decryption.
- Add credential testing.
- Add credential health tracking.
- Add administrative permissions and audit logs.

### Phase 4: Usage and administration

- Implement usage recording.
- Add token and cost estimation.
- Build provider, credential, model, and routing controls.
- Build usage and operational dashboards.

### Phase 5: Reliability and optimisation

- Improve streaming.
- Add rate and concurrency controls.
- Implement health monitoring.
- Improve retries and fallback behaviour.
- Add caching where safe.
- Review performance and operational costs.

## 17. Open Decisions

The following decisions require confirmation during implementation:

- Exact provider adapter interface.
- Initial Gemini models and their supported capabilities.
- Whether provider configuration and routing changes require deployment or can be applied dynamically.
- Credential encryption implementation and key-rotation strategy.
- Whether credential selection should be round-robin, priority-based, health-based, or explicitly assigned.
- Usage aggregation and retention periods.
- Exact administrative permission levels.
- Whether AI request content should ever be retained for debugging, and under what safeguards.
- Which tasks require structured output or independent verification.
- How institution-level AI budgets and limits should work.

Do not hardcode unresolved decisions into the architecture.

## 18. Implemented AI Gateway (November 2026)

The following describes the implemented gateway as it currently exists in `apps/api/src/lib/ai/gateway/`.

### Architecture

The gateway is built as a TypeScript module inside the Cloudflare Workers API app. It does not live in a separate `packages/ai` package — it was placed inside `apps/api` to keep it close to the D1 binding and avoid unnecessary cross-package complexity at this stage.

```text
apps/api/src/lib/ai/gateway/
├── index.ts              — Public AiGateway interface and createAiGateway factory
├── types.ts              — Shared TypeScript types and Zod schemas
├── encryption.ts         — AES-256-GCM credential encryption via Web Crypto API
├── credential-manager.ts — Credential CRUD, health tracking, masked key management
├── router.ts             — LRU credential selection with retry context and quota circuit-breaker
├── model-registry.ts     — Registered Gemini models and capability flags
├── errors.ts             — Error classification, GatewayError, AllCredentialsUnavailableError
├── gemini-adapter.ts     — Gemini text, streaming, multimodal, audio, and Live session support
├── usage-manager.ts      — Usage event and route event recording to D1
└── auth-middleware.ts    — Hono middleware enforcing super-admin access
```

### Credential encryption

Credentials are encrypted with AES-256-GCM before D1 storage. Each encryption operation generates a unique IV. The master key is stored as a Cloudflare Worker secret — never in D1, source code, or environment files.

**Setup:**

```bash
# Generate a 32-byte key
openssl rand -base64 32

# Configure as a Worker secret
wrangler secret put AI_CREDENTIAL_ENCRYPTION_KEY
```

The database holds: encrypted ciphertext, IV, key version, and masked key. Without the external secret, a D1 dump reveals no plaintext credential.

**Key rotation:** Increment `KEY_VERSION` in `encryption.ts`, re-encrypt existing credentials using the old key and store with the new key, then update the Worker secret. The `keyVersion` column in `ai_credentials` supports this.

### Database schema

Three tables are used, defined in `apps/api/src/db/schema/ai.ts`:

- `ai_credentials` — credential records (encrypted key, IV, version, masked key, status, health metadata)
- `ai_usage_events` — per-request usage records (tokens, latency, status, error category)
- `ai_route_events` — routing decisions and failover events

Migrations are in `apps/api/drizzle/`. Apply locally with:

```bash
wrangler d1 migrations apply examinr-dev --local
```

### Credential management API

All endpoints are under `/api/admin/ai/credentials`. They require an authenticated super-admin session.

| Method | Path | Action |
|---|---|---|
| GET | `/api/admin/ai/credentials` | List credentials and stats |
| POST | `/api/admin/ai/credentials` | Add a credential (name + apiKey + provider) |
| GET | `/api/admin/ai/credentials/:id` | Get one credential |
| PATCH | `/api/admin/ai/credentials/:id/name` | Rename |
| POST | `/api/admin/ai/credentials/:id/enable` | Enable |
| POST | `/api/admin/ai/credentials/:id/disable` | Disable |
| POST | `/api/admin/ai/credentials/:id/test` | Test validity (live API call) |
| DELETE | `/api/admin/ai/credentials/:id` | Delete |
| GET | `/api/admin/ai/credentials/stats/overview` | Usage and health overview |

Raw API keys are **never** returned after submission. Responses include only masked keys.

### Super-admin authorization

Super-admin access is controlled by the `SUPER_ADMIN_EMAILS` Worker secret — a comma-separated list of email addresses. Set it with:

```bash
wrangler secret put SUPER_ADMIN_EMAILS
# Enter: admin@example.com,backup@example.com
```

If the secret is unset, all credential API calls return 503. Unauthorized requests return 401 or 403.

### Routing strategy

The router uses **LRU (least-recently-used) ordering via D1** — no in-memory global state. This distributes load correctly across Worker isolate restarts.

Retry behaviour:
- Up to 3 total attempts per request.
- After each failure, the credential is excluded from subsequent attempts.
- After 2 consecutive quota failures, the router short-circuits with `AllCredentialsUnavailableError` — this conservatively handles shared Google Cloud project quota exhaustion without endless rotation.

### Error classification

The `classifyGeminiError` function in `errors.ts` distinguishes:

| HTTP status / body pattern | Category | Retryable |
|---|---|---|
| 429 RESOURCE_EXHAUSTED | `quota_exceeded` | Yes (cooldown) |
| 429 (other) | `rate_limit` | Yes (cooldown) |
| 401 | `auth_failure` | No (marks invalid) |
| 403 + invalid key message | `invalid_credential` | No (marks invalid) |
| 403 + billing message | `billing_restricted` | No (long cooldown) |
| 403 (other) | `permission_denied` | No |
| 400 | `request_invalid` | No |
| 404 model | `model_unavailable` | No |
| 500 / 503 | `provider_error` | Yes (short cooldown) |
| Network | `network_error` | Yes |
| Timeout | `timeout` | Conditional |

### Supported models

Defined in `model-registry.ts`:

| ID | API name | Key capabilities |
|---|---|---|
| `gemini-flash` | `gemini-2.5-flash` | text, image input, audio input, streaming, structured output |
| `gemini-pro` | `gemini-2.5-pro` | text, image input, audio input, streaming, structured output |
| `gemini-flash-lite` | `gemini-2.5-flash-lite` | text, image input, streaming, structured output |
| `gemini-flash-2` | `gemini-2.0-flash` | text, image input, audio input, streaming |
| `gemini-live` | `gemini-2.0-flash-live-001` | realtime audio, audio output, Live API |

### Gemini Live session flow

1. Backend calls `gateway.provisionLiveSession({ userId, model, systemInstruction })`.
2. Gateway selects an eligible credential and calls the Gemini ephemeral token API.
3. An ephemeral token and WebSocket URL are returned to the client.
4. The client connects to the Live API WebSocket using the ephemeral token.
5. The permanent API key is **never sent to the browser**.

Ephemeral tokens are not persisted in D1 or logs.

### Admin dashboard

The super-admin dashboard is at `/admin/ai` in the web app (`apps/web/app/admin/ai/page.tsx`). It provides:

- Credential overview stats (total, active, disabled, invalid, cooldown)
- Request success rate display
- Add credential form (name + API key only — no Google project fields)
- Credential table with enable/disable/rename/delete/test actions
- Confirmation prompt before deletion
- Recent activity table (model, modality, status, latency, retries)

### Environment variables required

| Secret | Purpose | How to set |
|---|---|---|
| `AI_CREDENTIAL_ENCRYPTION_KEY` | Master encryption key (base64, 32 bytes) | `wrangler secret put AI_CREDENTIAL_ENCRYPTION_KEY` |
| `SUPER_ADMIN_EMAILS` | Comma-separated super-admin email addresses | `wrangler secret put SUPER_ADMIN_EMAILS` |

### Running tests

```bash
cd apps/api
pnpm test
```

45 tests cover: encryption (12), error classification (15), credential manager and router logic (11), Gemini adapter multimodal and Live token provisioning (7).

### Known limitations and future work

- The gateway lives inside `apps/api` rather than the planned `packages/ai`. It can be extracted later when other apps need it.
- Super-admin identity is determined by email list (SUPER_ADMIN_EMAILS secret) rather than a database role, since the Better Auth roles plugin is not yet configured.
- The `testCredential` endpoint makes a real Gemini API call that counts against quota. Document this to users.
- Streaming failover is not transparent — if a stream starts and the connection fails mid-stream, the client must handle the interruption.
- OpenAI and Anthropic provider adapters are not implemented. The architecture supports adding them via the provider adapter pattern in `gemini-adapter.ts`.
- Usage cost estimation is not implemented — token counts are recorded but no price calculation is applied, as prices change frequently.

## 19. Relationship to Other Documents

- `PRODUCT.md` defines the AI-powered learning experiences Examinr must provide.
- `ARCHITECTURE.md` defines where the gateway fits into the wider application.
- `DATABASE.md` defines persistence for AI configuration, credentials, and usage records.
- `DESIGN_SYSTEM.md` defines the interface standards for AI-powered features and administration.
- `ROADMAP.md` defines implementation priorities.
- `PROGRESS.md` tracks completed work and current implementation status.

---

## Final Principle

Examinr's AI gateway is infrastructure, not the product itself.

Its purpose is to make intelligent learning features reliable, configurable, secure, measurable, and replaceable without tying the entire platform to one provider or model.