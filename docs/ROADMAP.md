# Roadmap

## 1. Purpose

This roadmap defines Examinr's intended development direction and implementation priorities.

It provides a shared reference for deciding:

- What should be built first.
- Which systems depend on other systems.
- What belongs in the initial release.
- What should be postponed.
- How the platform should evolve over time.

The roadmap is directional. It should be updated as implementation progresses, requirements become clearer, and user feedback reveals new priorities.

`PROGRESS.md` tracks actual implementation status. This document describes the intended direction.

## 2. Product Direction

Examinr is an AI-powered examination preparation and personalised learning platform, initially focused on Nigerian students.

Its core learning cycle is:

**Understand → Assess → Identify → Recommend → Learn → Practise → Evaluate → Adapt**

The development strategy is to build this cycle into a reliable, usable product before expanding into more complex institutional and administrative capabilities.

The initial market focus is:

- WAEC.
- NECO.
- JAMB UTME.
- Post-UTME.

The architecture should allow additional examination systems and markets later.

## 3. Development Principles

### Build the foundation before expanding

Authentication, academic data, question management, examinations, and learning records must have reliable foundations.

### Prioritise the student experience

The student learning journey is the primary product experience. Institutional and administrative features should support it rather than distract from it.

### Build complete workflows

A feature is not complete simply because its interface exists. Its data, backend operations, validation, error handling, and user experience must work together.

### Keep AI replaceable

AI capabilities should be integrated through the internal gateway rather than directly into individual features.

### Avoid premature complexity

Do not introduce infrastructure, services, or dependencies without a clear product or engineering reason.

### Validate educational quality

Questions, explanations, marking, and recommendations must be tested for educational usefulness and accuracy.

## 4. Phase 0 — Project Foundation

<badge color="success">Foundation</badge>

Establish the engineering foundation required for the rest of the platform.

### Repository and tooling

- [ ] Establish the pnpm/Turborepo monorepo.
- [ ] Configure shared TypeScript settings.
- [ ] Configure ESLint and formatting conventions.
- [ ] Establish environment variable conventions.
- [ ] Configure local development workflows.
- [ ] Establish build and validation scripts.
- [ ] Establish project-wide agent instructions.

### Application foundation

- [ ] Configure the Next.js web application.
- [ ] Configure the Cloudflare Workers API.
- [ ] Establish shared UI package conventions.
- [ ] Establish shared API contracts.
- [ ] Establish database package conventions.
- [ ] Establish internal AI package conventions.

### Engineering standards

- [ ] Enforce strict TypeScript.
- [ ] Establish testing conventions.
- [ ] Establish error-handling conventions.
- [ ] Establish logging conventions.
- [ ] Establish Git and contribution conventions.

**Completion criteria:** Developers and coding agents can understand, install, run, validate, and extend the project consistently.

## 5. Phase 1 — Core Infrastructure

Build the backend foundations required by the learning platform.

### Database

- [ ] Establish PostgreSQL connectivity.
- [ ] Configure Drizzle ORM.
- [ ] Establish schema and migration workflows.
- [ ] Implement user and profile foundations.
- [ ] Implement examination and academic structures.
- [ ] Implement subject and topic structures.
- [ ] Establish database validation and seed data.

### Authentication and authorisation

- [ ] Implement authentication.
- [ ] Implement session management.
- [ ] Establish role-based access control.
- [ ] Establish protected API routes.
- [ ] Establish account and profile management.
- [ ] Implement secure password and account recovery flows where applicable.

### API foundations

- [ ] Establish API conventions.
- [ ] Implement request validation.
- [ ] Implement consistent response structures.
- [ ] Implement centralised error handling.
- [ ] Implement rate limiting where required.
- [ ] Establish request logging and observability.

### Infrastructure

- [ ] Establish development and production environments.
- [ ] Configure secure secret management.
- [ ] Establish deployment workflows.
- [ ] Establish database backup and recovery procedures.

**Completion criteria:** The application has a reliable, secure foundation for authenticated users and academic data.

## 6. Phase 2 — Academic Content and Question Bank

Build the educational data structures that power practice and examinations.

### Academic structure

- [ ] Implement examination systems.
- [ ] Implement subjects.
- [ ] Implement topic and subtopic hierarchies.
- [ ] Support examination-specific subject structures.
- [ ] Connect students to their selected examination and subjects.

### Question bank

- [ ] Implement question management.
- [ ] Support multiple question types.
- [ ] Support answer options and correct answers.
- [ ] Support explanations and marking information.
- [ ] Store question provenance.
- [ ] Establish verification and review statuses.
- [ ] Implement question search and filtering.
- [ ] Establish question versioning or equivalent historical preservation.

### Content quality

- [ ] Establish question validation rules.
- [ ] Establish content review workflows.
- [ ] Support examination and syllabus tagging.
- [ ] Create a process for identifying inaccurate or duplicated questions.

**Completion criteria:** Examinr can reliably store, retrieve, organise, and validate academic questions.

## 7. Phase 3 — Student Learning Experience

Build the primary student-facing product.

### Student onboarding

- [ ] Create student registration and login flows.
- [ ] Collect essential student information.
- [ ] Allow examination selection.
- [ ] Allow subject selection.
- [ ] Establish initial learning preferences.
- [ ] Create a personalised student profile.

### Student home

- [ ] Build the student dashboard.
- [ ] Display selected examinations and subjects.
- [ ] Display learning progress.
- [ ] Display recommended activities.
- [ ] Display recent learning activity.
- [ ] Provide clear access to primary learning workflows.

### Study experience

- [ ] Build subject navigation.
- [ ] Build topic and subtopic navigation.
- [ ] Build the topic learning interface.
- [ ] Support structured explanations and learning materials.
- [ ] Connect topics to relevant practice activities.

### Practice and examinations

- [ ] Build practice sessions.
- [ ] Build examination configuration.
- [ ] Build the examination interface.
- [ ] Support answer submission.
- [ ] Support examination timing where applicable.
- [ ] Implement automatic marking for supported question types.
- [ ] Implement result generation.
- [ ] Preserve examination attempt history.
- [ ] Build review and explanation screens.

**Completion criteria:** A student can register, select an examination and subjects, study topics, practise questions, complete examinations, and review results.

## 8. Phase 4 — Performance and Personalisation

Make Examinr meaningfully adaptive rather than simply displaying static content.

### Performance tracking

- [ ] Track student practice activity.
- [ ] Track examination attempts.
- [ ] Track topic-level performance.
- [ ] Track subject-level performance.
- [ ] Identify recurring mistakes.
- [ ] Maintain historical performance records.

### Learning insights

- [ ] Build performance summaries.
- [ ] Identify strengths and weaknesses.
- [ ] Display progress over time.
- [ ] Distinguish insufficient data from demonstrated weakness.
- [ ] Provide meaningful performance explanations.

### Recommendations

- [ ] Establish recommendation rules.
- [ ] Recommend topics based on performance.
- [ ] Recommend relevant practice activities.
- [ ] Prioritise weak or neglected areas.
- [ ] Track recommendation interactions.
- [ ] Adapt recommendations using new learning evidence.

**Completion criteria:** Examinr can use actual student activity and performance data to identify learning needs and recommend useful next steps.

## 9. Phase 5 — AI Learning Infrastructure and Features

Integrate the internal AI gateway into the learning experience.

### Gateway

- [ ] Implement the internal AI gateway.
- [ ] Integrate the first AI provider.
- [ ] Implement provider adapters.
- [ ] Implement model registration.
- [ ] Implement configurable task routing.
- [ ] Implement credential management.
- [ ] Implement secure credential encryption.
- [ ] Implement usage tracking.
- [ ] Implement cost estimation.
- [ ] Implement controlled fallbacks.
- [ ] Implement streaming support where required.

### AI learning features

- [ ] Implement AI tutoring.
- [ ] Implement context-aware explanations.
- [ ] Implement question generation.
- [ ] Implement answer evaluation support.
- [ ] Implement performance analysis.
- [ ] Implement study recommendations.
- [ ] Validate structured AI outputs.
- [ ] Establish quality and accuracy evaluation.

### AI administration

- [ ] Build provider management.
- [ ] Build credential management.
- [ ] Build model management.
- [ ] Build routing configuration.
- [ ] Build usage monitoring.
- [ ] Build operational logs and health monitoring.

**Completion criteria:** AI-powered learning features work through a controlled, measurable, and secure gateway.

## 10. Phase 6 — Product Completeness

Complete the supporting features required for a polished initial release.

### Achievements

- [ ] Implement achievement definitions.
- [ ] Track achievement progress.
- [ ] Award achievements based on defined rules.
- [ ] Build achievement displays.
- [ ] Ensure achievements reflect meaningful learning activity.

### Profile and settings

- [ ] Complete profile management.
- [ ] Implement account settings.
- [ ] Implement learning preferences.
- [ ] Implement notification preferences.
- [ ] Implement billing settings where applicable.
- [ ] Implement help and support.
- [ ] Implement privacy and security controls.

### Notifications

- [ ] Establish in-app notifications.
- [ ] Implement notification preferences.
- [ ] Support relevant learning and account notifications.

### Institutions foundation

- [ ] Implement institution records.
- [ ] Implement institution memberships.
- [ ] Implement invitation codes or links.
- [ ] Implement student institution association.
- [ ] Establish tenant isolation and permissions.
- [ ] Define what institution administrators can access.

**Completion criteria:** The core student product has its supporting account, engagement, notification, and institutional foundations.

## 11. Phase 7 — Testing, Quality, and Initial Release

Prepare Examinr for real students and operational use.

### Product quality

- [ ] Test complete student workflows.
- [ ] Test examination submission and result integrity.
- [ ] Test performance calculations.
- [ ] Test recommendation quality.
- [ ] Test AI response quality.
- [ ] Test account and permission boundaries.
- [ ] Test institutional data isolation.
- [ ] Test responsive layouts.
- [ ] Test accessibility.
- [ ] Test error and recovery states.

### Engineering quality

- [ ] Add unit tests for critical business logic.
- [ ] Add integration tests for important API workflows.
- [ ] Add end-to-end tests for critical user journeys.
- [ ] Review database indexes and query performance.
- [ ] Review API security.
- [ ] Review AI usage and operational costs.
- [ ] Test backup and recovery procedures.
- [ ] Establish production monitoring.

### Release preparation

- [ ] Prepare production deployment.
- [ ] Establish support and issue-reporting workflows.
- [ ] Prepare initial academic content.
- [ ] Validate examination and syllabus coverage.
- [ ] Conduct a controlled student testing period.
- [ ] Resolve critical feedback and defects.

**Completion criteria:** Examinr is stable enough for an initial controlled release to real students.

## 12. Phase 8 — Expansion

Expansion should follow evidence from actual usage rather than assumptions.

Potential areas include:

### Institutional tools

- Teacher dashboards.
- Class management.
- Assignments.
- Institution-level performance insights.
- Teacher-created assessments.
- Institutional reporting.
- School administration controls.

### Learning expansion

- Additional examination systems.
- More subjects and curricula.
- Improved adaptive learning.
- More detailed learning analytics.
- Additional question formats.
- Study plans and scheduling.

### Platform expansion

- Additional AI providers.
- Mobile applications or improved mobile experiences.
- Additional notification channels.
- More advanced subscription management.
- Expanded administrative controls.
- International examination markets.

These are potential directions, not commitments to immediate implementation.

## 13. Priority Guidelines

When deciding what to implement next, use the following order:

1. Critical foundations and security.
2. Features required to complete the core student learning cycle.
3. Reliability and educational accuracy.
4. Personalisation and learning intelligence.
5. Supporting product features.
6. Institutional expansion.
7. Additional convenience and advanced features.

A visually impressive feature should not take priority over a broken core learning workflow.

## 14. Scope Control

Before adding a feature, establish:

- What student or institutional problem does it solve?
- Which product requirement does it support?
- Is it necessary for the initial release?
- What existing systems does it depend on?
- What data does it require?
- What is the smallest complete implementation?
- What maintenance or operational cost will it introduce?

Avoid implementing features simply because they are technically interesting.

Do not introduce unnecessary dependencies or infrastructure before there is a demonstrated need.

## 15. Roadmap Maintenance

This document should be updated when:

- Product priorities change.
- A phase is completed.
- A major dependency changes.
- A feature is postponed or removed.
- New evidence changes the product direction.

Use `PROGRESS.md` for the current implementation status.

Do not mark work as complete merely because a coding agent generated code. Completion requires implementation, validation, and integration.

---

## Final Principle

Build Examinr in the order that creates the most reliable learning experience.

The goal is not to ship the largest number of features. It is to build a platform that genuinely helps students understand more, practise better, and improve their examination performance.