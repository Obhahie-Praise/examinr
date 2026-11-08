# AGENTS.md

# Examinr — AI Agent Instructions

This document defines the rules and working expectations for AI coding agents operating within the Examinr repository.

All agents must read and follow these instructions before making changes. These instructions apply across all applications, packages, infrastructure, and documentation unless a more specific instruction file explicitly extends them.

The objective is to build Examinr as a coherent, reliable, maintainable product—not merely to complete isolated coding tasks.

---

## 1. Understand the Project First

Examinr is an AI-powered examination preparation and personalised learning platform, initially focused on Nigerian students and their examination systems.

The platform is designed to help students:

- Understand what they need to study.
- Access personalised learning recommendations.
- Practise through structured questions and examinations.
- Get explanations and academic guidance through AI.
- Identify knowledge gaps and track their performance.
- Build consistent learning habits and recognise progress.

Examinr also supports teachers and educational institutions through dedicated experiences and administrative capabilities.

Do not treat Examinr as a generic AI chatbot, question-generation tool, or examination website. Its core purpose is to support the student's entire preparation and learning journey.

### Source of Truth

Before implementing a task, consult the relevant project documentation.

| Document | What it governs |
|---|---|
| `docs/PRODUCT.md` | Product vision, users, requirements, features, and scope |
| `docs/ARCHITECTURE.md` | System architecture, services, and application boundaries |
| `docs/DATABASE.md` | Database structure, relationships, and migrations |
| `docs/AI_SYSTEM.md` | AI gateway, providers, routing, and usage |
| `docs/DESIGN_SYSTEM.md` | Visual identity, components, and interface conventions |
| `docs/ROADMAP.md` | Planned milestones and priorities |
| `docs/PROGRESS.md` | Current implementation status |

If documentation and implementation disagree, do not automatically assume either is correct. Investigate the discrepancy and report it. Do not silently change established behaviour or documented decisions.

---

## 2. Mandatory Working Process

Every non-trivial task must follow this process.

### Step 1 — Understand

- Read this file.
- Read the documentation relevant to the task.
- Inspect the existing implementation.
- Identify the affected applications, packages, APIs, and data structures.
- Understand existing patterns before introducing new ones.

Do not begin implementation based solely on a task description when the existing codebase contains relevant context.

### Step 2 — Plan

Establish:

- What needs to change.
- Why the change is necessary.
- Which files and packages are affected.
- Whether existing functionality can be reused.
- Whether the change affects database schemas, API contracts, authentication, permissions, or AI infrastructure.
- What validation will demonstrate that the task is complete.

For substantial tasks, provide a concise implementation plan before making changes.

Do not over-engineer small tasks with unnecessary planning.

### Step 3 — Implement

- Make focused, coherent changes.
- Follow existing architectural and coding conventions.
- Reuse established components and utilities.
- Keep responsibilities separated.
- Preserve existing functionality unless the task explicitly requires changing it.
- Avoid unrelated refactoring.

### Step 4 — Validate

Run the relevant checks supported by the repository:

- Type checking.
- Linting.
- Tests.
- Build checks.
- Manual verification where necessary.

Inspect the output rather than assuming a command succeeded.

Never conceal failing checks or claim that unverified functionality works.

### Step 5 — Report

At the end of a task, provide a concise summary containing:

1. What changed.
2. Important implementation decisions.
3. Files or packages affected.
4. Validation performed and its results.
5. Remaining issues, limitations, or follow-up work.

Update `docs/PROGRESS.md` when the implementation status materially changes.

---

## 3. Engineering Standards

### TypeScript

TypeScript is the primary development language.

- Maintain strict TypeScript.
- Never introduce `any`.
- Prefer interfaces for object contracts where appropriate.
- Use explicit types for public APIs and shared package exports.
- Use `unknown` and proper narrowing when handling uncertain values.
- Avoid unnecessary type assertions.
- Avoid suppressing compiler errors without a documented reason.
- Validate external data at system boundaries.

Do not weaken TypeScript configuration to make an implementation compile.

### Code Quality

- Prioritise readability and maintainability.
- Keep functions and components focused.
- Use descriptive naming.
- Avoid duplicated business logic.
- Prefer straightforward solutions over unnecessary abstraction.
- Handle errors deliberately.
- Avoid silent failures.
- Remove temporary debugging code before completing a task.
- Do not leave placeholder implementations disguised as completed functionality.

### Dependencies

Before introducing a dependency:

1. Check whether the required functionality already exists in the repository.
2. Check whether an existing dependency can handle the requirement.
3. Consider the dependency's maintenance, security, size, and compatibility.
4. Introduce it only when there is a clear benefit.

Do not install packages merely because they are commonly used in other projects.

Do not modify dependency versions or lockfiles unnecessarily.

---

## 4. Monorepo Architecture

Examinr uses pnpm workspaces and Turborepo.

The repository separates applications from reusable packages.

### Applications

Applications are responsible for their own runtime entry points and application-specific functionality.

Avoid placing reusable business logic in an application when it clearly belongs in a shared package.

### Shared Packages

Shared packages should have clear responsibilities.

- `packages/ui`: Shared interface components and UI foundations.
- `packages/db`: Database schema, database access, and related utilities.
- `packages/ai`: AI gateway, provider adapters, routing, and related functionality.
- `packages/contracts`: Shared validation schemas, types, and API contracts.

Follow the actual package responsibilities and exports defined in the repository.

### Architecture Rules

- Do not create unnecessary cross-package dependencies.
- Avoid circular dependencies.
- Do not duplicate shared functionality across applications.
- Keep infrastructure-specific code behind appropriate boundaries.
- Do not introduce new applications or packages without a clear architectural reason.
- Respect existing package exports and workspace conventions.
- Prefer explicit dependencies over hidden coupling.

Before moving code between packages, understand its consumers and existing dependencies.

---

## 5. Frontend and Design System

The frontend must follow Examinr's established design direction.

Read `docs/DESIGN_SYSTEM.md` before implementing or significantly modifying interfaces.

### Visual Consistency

- Reuse existing components and design tokens.
- Maintain consistent spacing, typography, colours, and interaction patterns.
- Avoid arbitrary styling values when established tokens exist.
- Maintain responsive layouts.
- Use semantic HTML.
- Provide accessible labels and keyboard interactions.
- Avoid unnecessary animations and decorative elements.

### Product Experience

Every interface should account for relevant application states:

- Loading.
- Empty.
- Success.
- Error.
- Disabled.
- Unauthenticated.
- Unauthorised.
- Offline or degraded connectivity, where relevant.

Do not implement only the ideal successful state.

### Design Constraints

- No emojis anywhere in the project.
- Use proper interface icons from the established icon library when appropriate.
- Do not introduce new visual styles without a clear reason.
- Avoid redesigning unrelated screens.
- Do not replace established layouts or components simply because another implementation is easier.

A functional interface is not automatically a good interface. Preserve the intended user experience.

---

## 6. Backend and API

Backend functionality must be secure, predictable, and maintainable.

- Validate all relevant incoming data.
- Enforce authentication and authorisation on the server.
- Never rely on client-side permissions.
- Keep API responses consistent.
- Handle errors explicitly.
- Apply appropriate rate limits and abuse prevention.
- Avoid exposing internal errors, secrets, or sensitive implementation details.
- Keep business logic separate from transport-specific concerns where practical.

### Cloudflare

Examinr's backend uses Cloudflare infrastructure.

When implementing Cloudflare functionality:

- Follow the existing Worker configuration.
- Respect compatibility dates and runtime constraints.
- Use Durable Objects only where coordinated state or real-time behaviour requires them.
- Use HTTP streaming or SSE where suitable for streamed responses.
- Avoid introducing WebSockets for functionality that ordinary HTTP can handle.
- Keep environment-specific configuration separate from application logic.

Do not assume that a feature supported by Node.js is automatically supported by the Workers runtime.

---

## 7. Database and Data Integrity

Read `docs/DATABASE.md` before making database changes.

- Follow the established Drizzle ORM conventions.
- Keep schema definitions and migrations synchronised.
- Use explicit relationships and appropriate constraints.
- Preserve referential integrity.
- Consider existing records before modifying or removing fields.
- Avoid destructive migrations without a clear strategy.
- Use transactions where multiple related operations must succeed or fail together.
- Avoid unnecessary queries and inefficient data access patterns.

Never assume that data received from the client is valid or trustworthy.

Student records, examination results, institutional information, and other sensitive data must be protected through appropriate access controls.

---

## 8. AI Infrastructure

All application AI functionality must use Examinr's shared AI infrastructure.

Read `docs/AI_SYSTEM.md` before implementing AI-related functionality.

### Core Rules

- Do not create independent provider integrations inside application features.
- Use the shared AI gateway.
- Keep provider-specific behaviour inside provider adapters.
- Separate model selection and routing from application business logic.
- Handle timeouts, rate limits, provider failures, and invalid outputs.
- Track usage and costs where appropriate.
- Validate AI-generated structured outputs before using them.
- Design for provider changes without requiring application-wide rewrites.

### Credentials and Security

- Never expose provider API keys to the browser.
- Never hardcode secrets.
- Never log raw credentials.
- Use the established server-side credential management approach.
- Protect student information and minimise unnecessary data sent to providers.

### Educational Reliability

AI-generated educational content must not automatically be treated as correct.

Where applicable:

- Validate generated questions and answer structures.
- Preserve examination-specific requirements.
- Avoid presenting unsupported claims as established facts.
- Make uncertainty clear.
- Ensure generated explanations are appropriate to the student's learning context.

---

## 9. Authentication, Permissions, and Privacy

Security must be enforced at the server boundary.

- Verify user identity before accessing protected resources.
- Verify resource ownership and institutional permissions.
- Apply role-based access where required.
- Do not trust user IDs, roles, or permissions supplied by the client.
- Avoid exposing data across students, teachers, or institutions.
- Keep sensitive information out of URLs and unnecessary logs.
- Respect data minimisation and retention requirements.

An authenticated user is not automatically authorised to access every resource.

Institutional access must follow the permissions and relationships defined by the product and architecture.

---

## 10. Testing and Quality Assurance

Tests should verify actual behaviour rather than merely implementation details.

Prioritise testing for:

- Authentication and authorisation.
- Examination creation and submission.
- Question validation and evaluation.
- Student performance calculations.
- Database operations.
- AI routing and failure handling.
- Institutional data boundaries.
- Critical user journeys.

When fixing a bug, add or update a regression test where practical.

Do not remove or weaken tests simply to make a build pass.

If tests cannot be executed, clearly report why.

---

## 11. Documentation and Progress Tracking

The seven documents in `docs/` are the central project documentation.

Keep them concise and accurate.

Update the relevant document when:

- A product requirement changes.
- An architectural decision is made.
- A database structure changes.
- AI routing or provider behaviour changes.
- A design-system convention changes.
- A milestone is completed or reprioritised.

### Progress Tracking

`docs/PROGRESS.md` must reflect actual implementation status.

- Mark work complete only after implementation and relevant validation.
- Distinguish completed work from partially implemented work.
- Record important blockers.
- Avoid marking planned functionality as implemented.
- Do not rewrite the entire progress document for a small update.

Do not create additional documentation files unless explicitly requested or clearly necessary.

---

## 12. Scope Control

Stay within the task's intended scope.

Do not:

- Rewrite entire modules to make a small change.
- Introduce new architectural patterns without justification.
- Replace working dependencies without a clear reason.
- Redesign unrelated interfaces.
- Add speculative features.
- Introduce premature abstractions.
- Change product behaviour without considering its documented requirements.
- Claim that a feature is implemented when it is only a mockup or placeholder.

If a task exposes a larger problem, report it separately rather than silently expanding the scope.

If a critical decision is missing, ask for clarification instead of inventing a permanent product or architectural rule.

---

## 13. Git and Repository Safety

- Inspect the current Git state before making changes.
- Do not overwrite unrelated user modifications.
- Do not discard uncommitted work.
- Do not reset, rebase, force-push, or delete branches without explicit authorisation.
- Do not commit secrets or local environment files.
- Keep changes focused.
- Use the existing commit conventions.

Never assume the working tree is clean.

---

## 14. Definition of Done

A task is complete only when all applicable conditions are satisfied:

- The requested behaviour is implemented.
- Existing functionality remains intact.
- The implementation follows project architecture and conventions.
- Relevant types and contracts are correct.
- Relevant loading, error, and empty states are handled.
- Security and permissions are considered.
- Relevant validation has been performed.
- Documentation and progress records are updated where necessary.
- Remaining limitations are clearly reported.

A successful build alone does not prove that a feature is complete.

---

## Final Principle

**Build Examinr as one coherent product, not a collection of disconnected features.**

Every implementation decision should contribute to a platform that is reliable, understandable, secure, and genuinely useful to the students and institutions it serves.

When in doubt, inspect before implementing, preserve what works, follow documented decisions, and ask rather than invent.