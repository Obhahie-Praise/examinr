# Contributing to Examinr

Thank you for contributing to Examinr.

This document establishes the development practices, coding standards, and collaboration guidelines used across the repository. Its purpose is to keep the codebase consistent, maintainable, secure, and easy to extend as the project grows.

Examinr is developed through a combination of direct engineering and AI-assisted development. These guidelines apply to both.

---

## 1. Getting Started

### Prerequisites

Before working on the project, ensure you have:

- Node.js (LTS)
- pnpm
- Git

### Set Up the Repository

```bash
# Clone the repository
git clone <repository-url>

# Enter the project directory
cd examinr

# Install dependencies
pnpm install

# Start the development environment
pnpm dev
```

Some applications and packages may require environment variables before they can run. Refer to the relevant setup instructions and environment examples when available.

Never commit actual secrets or local environment files.

---

## 2. Repository Structure

Examinr uses a pnpm workspace managed by Turborepo.

```text
examinr/
├── apps/
│   ├── web/                  # Main web application
│   └── api/                  # Backend API
│
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── db/                   # Database schema and access
│   ├── ai/                   # AI gateway and integrations
│   └── contracts/            # Shared schemas and contracts
│
├── docs/                     # Product and engineering documentation
├── AGENTS.md                 # Coding-agent instructions
├── CONTRIBUTING.md
└── README.md
```

The structure may evolve as the application develops. Follow the existing repository structure rather than introducing new architectural patterns without a clear reason.

### Workspace Guidelines

- Keep application-specific code inside the appropriate application.
- Place genuinely reusable functionality in shared packages.
- Avoid duplicating logic across applications.
- Keep package responsibilities clearly defined.
- Avoid unnecessary dependencies between packages.
- Do not introduce a shared package for functionality that has only one clear consumer without a good reason.

---

## 3. Development Workflow

Contributions should follow a deliberate process.

1. **Understand the task:** Identify the problem, expected behaviour, and relevant product requirements.
2. **Review existing implementation:** Inspect the affected code, existing patterns, and related documentation before making changes.
3. **Plan the change:** Identify the files, packages, and systems that will be affected.
4. **Implement:** Make the smallest coherent change that solves the problem.
5. **Validate:** Run the relevant checks and test the affected functionality.
6. **Document:** Update documentation when architectural decisions, product behaviour, or implementation status changes.
7. **Review:** Inspect the final diff for unintended changes, duplication, and incomplete implementation.

Avoid implementing features based on assumptions when the intended behaviour is unclear. Resolve important uncertainties before making architectural decisions.

---

## 4. Coding Standards

### TypeScript

TypeScript is the primary development language.

- Use strict TypeScript.
- Avoid `any`. Use proper types, generics, `unknown`, or discriminated unions where appropriate.
- Prefer interfaces for object contracts where suitable.
- Define explicit types for public package APIs.
- Avoid unnecessary type assertions.
- Validate external and untrusted data at system boundaries.
- Keep types understandable and maintainable.

### Code Quality

- Prefer readable, straightforward implementations over unnecessary abstraction.
- Keep functions and components focused on one responsibility.
- Avoid duplicated business logic.
- Use descriptive names for variables, functions, components, and types.
- Handle errors deliberately rather than silently ignoring them.
- Avoid unnecessary dependencies and excessive configuration.
- Do not leave unfinished code, placeholder implementations, or temporary debugging statements in completed work.

### Naming

Use consistent naming conventions:

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `StudentDashboard` |
| Interfaces and types | PascalCase | `StudentProfile` |
| Functions | camelCase | `getStudentProgress` |
| Variables | camelCase | `currentStudent` |
| Constants | UPPER_SNAKE_CASE where appropriate | `MAX_ATTEMPTS` |
| Files | Follow the existing convention | `student-profile.tsx` |

Follow the conventions of the package or application being modified when they differ.

---

## 5. Frontend Development

The frontend should maintain a consistent, accessible, and predictable user experience.

- Reuse existing shared UI components where appropriate.
- Follow the established design system.
- Avoid introducing arbitrary colours, spacing values, typography, or interaction patterns.
- Ensure responsive behaviour across supported screen sizes.
- Use semantic HTML and accessible interaction patterns.
- Include loading, empty, error, and success states where relevant.
- Avoid unnecessary client-side state and effects.
- Keep business logic out of presentation components where practical.

Do not redesign unrelated parts of the application while implementing a feature.

Refer to `docs/DESIGN_SYSTEM.md` for visual and interface conventions.

---

## 6. Backend and API Development

Backend functionality should be predictable, secure, and appropriately separated.

- Validate incoming request data.
- Keep API contracts consistent.
- Apply authentication and authorisation checks where required.
- Never trust client-provided permissions or sensitive values.
- Handle errors consistently.
- Avoid exposing internal implementation details or secrets in responses.
- Keep database operations and business logic appropriately separated.
- Consider rate limits, resource usage, and abuse prevention for public-facing endpoints.

Refer to `docs/ARCHITECTURE.md` and `docs/DATABASE.md` for relevant system decisions.

---

## 7. Database Changes

Database changes must be deliberate and maintain compatibility with existing data.

- Use the established database access patterns.
- Keep schema definitions and migrations consistent.
- Do not make undocumented schema changes.
- Avoid destructive migrations without a clear migration strategy.
- Consider existing records and relationships when changing data structures.
- Validate data at appropriate boundaries.
- Never expose sensitive student information unnecessarily.

Refer to `docs/DATABASE.md` before changing database architecture or schema conventions.

---

## 8. AI System Development

AI functionality must use Examinr's established AI infrastructure rather than creating unrelated provider integrations throughout the codebase.

- Route AI requests through the shared AI system.
- Keep provider-specific logic behind appropriate adapters.
- Never expose API keys or provider credentials to the client.
- Validate model outputs before using them in critical application workflows.
- Handle provider failures, timeouts, and rate limits.
- Track usage and costs where applicable.
- Avoid assuming that AI-generated information is always correct.
- Preserve appropriate context and privacy boundaries when processing student data.

Refer to `docs/AI_SYSTEM.md` before modifying AI infrastructure, provider integrations, or routing behaviour.

---

## 9. Testing and Validation

Changes should be validated before they are considered complete.

Depending on the affected area, validation may include:

- Type checking
- Linting
- Unit tests
- Integration tests
- End-to-end tests
- Manual verification of relevant user flows

Run the checks supported by the affected workspace and inspect their results.

Do not claim that a change is complete when relevant checks are failing or have not been performed. If a check cannot be run, document the limitation.

---

## 10. Documentation

The `docs/` directory contains the authoritative project documentation.

| Document | Responsibility |
|---|---|
| `PRODUCT.md` | Product vision, users, requirements, and scope |
| `ARCHITECTURE.md` | System architecture and application boundaries |
| `DATABASE.md` | Database structure and data management |
| `AI_SYSTEM.md` | AI infrastructure and provider management |
| `DESIGN_SYSTEM.md` | Visual identity and interface conventions |
| `ROADMAP.md` | Planned milestones and priorities |
| `PROGRESS.md` | Current implementation status |

Documentation should remain concise, accurate, and useful.

Update the relevant document when a change materially affects its area. Do not create duplicate documentation or introduce new documentation files without a clear need.

---

## 11. AI-Assisted Development

AI coding agents are part of the Examinr development workflow. They are expected to follow the same engineering standards as human contributors.

Before making changes, agents should:

1. Read `AGENTS.md`.
2. Read the relevant documentation for the task.
3. Inspect the existing implementation and conventions.
4. Identify affected packages and application boundaries.
5. Understand existing functionality before replacing or modifying it.

During implementation, agents must:

- Avoid unnecessary rewrites and unrelated changes.
- Reuse existing components, utilities, and patterns.
- Avoid introducing dependencies without justification.
- Preserve strict TypeScript standards.
- Never invent APIs, environment variables, or existing functionality.
- Avoid silently changing established product or architectural decisions.
- Ask for clarification when a critical requirement is ambiguous.

After implementation, agents must:

- Run relevant validation checks.
- Review their changes.
- Report what was implemented.
- Identify outstanding issues and limitations.
- Update `docs/PROGRESS.md` when implementation status changes.
- Update relevant technical documentation when decisions or system behaviour change.

AI-generated code is not automatically considered correct. Every change remains subject to review and validation.

---

## 12. Git and Commit Guidelines

Use descriptive branch names and commit messages.

### Branch Naming

Recommended format:

```text
type/short-description
```

Examples:

```text
feat/student-onboarding
fix/exam-submission
refactor/ai-routing
docs/update-architecture
```

### Commit Messages

Use Conventional Commits:

```text
type(scope): short description
```

Examples:

```text
feat(web): add student onboarding
fix(api): handle invalid exam submissions
refactor(ai): simplify provider routing
docs(product): clarify v1 requirements
chore(repo): update workspace dependencies
```

Common commit types:

| Type | Purpose |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fixes |
| `refactor` | Code restructuring without intended behaviour changes |
| `docs` | Documentation changes |
| `test` | Test additions or modifications |
| `chore` | Maintenance and configuration |
| `perf` | Performance improvements |

Keep commits focused. Avoid mixing unrelated changes into a single commit.

---

## 13. Security Guidelines

Security is a fundamental requirement, especially because Examinr handles student information and potentially sensitive institutional data.

- Never commit API keys, passwords, tokens, or private credentials.
- Never expose server-side secrets to the browser.
- Do not bypass authentication or authorisation checks.
- Apply access controls at the server boundary.
- Avoid logging sensitive student information.
- Treat uploaded files and external data as untrusted.
- Report security vulnerabilities privately rather than publishing exploit details.

---

## 14. Project-Wide Conventions

The following conventions apply throughout the Examinr repository:

- No emojis in project documentation, code, comments, commit messages, or product copy.
- Maintain consistent naming and formatting.
- Prefer existing solutions over unnecessary new dependencies.
- Keep implementation aligned with documented product and architectural decisions.
- Do not introduce unrelated changes during feature development.
- Keep documentation and implementation status synchronised.

---

## Final Note

The objective is not to enforce unnecessary process. It is to make Examinr easier to build, understand, maintain, and extend.

Every contribution should leave the codebase clearer, more reliable, or more capable than it was before.