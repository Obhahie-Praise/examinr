# Examinr — Database Architecture

> Defines how Examinr stores, organises, relates, and protects application data.

**Status:** Living specification  
**Database:** PostgreSQL  
**ORM:** Drizzle ORM  
**Database package:** `packages/db`

---

## 1. Overview

Examinr uses PostgreSQL as its primary persistent database.

The database must support the platform's core domains:

- User accounts and profiles.
- Academic structures and examination systems.
- Subjects, topics, and learning resources.
- Question banks.
- Practice sessions and examinations.
- Student answers and assessment results.
- Learning progress and performance analytics.
- Personalised study recommendations.
- Institutions, memberships, and academic groups.
- Notifications and achievements.
- Subscriptions and billing records.
- AI usage and operational records.

The database should be designed around clear domain boundaries, explicit relationships, data integrity, and long-term maintainability.

### Core principles

1. Use relational structures where data has meaningful relationships.
2. Avoid unnecessary duplication.
3. Preserve historical examination and assessment records.
4. Enforce ownership and access boundaries.
5. Use database constraints to protect data integrity.
6. Keep schema definitions centralised.
7. Make schema changes through version-controlled migrations.
8. Avoid premature database abstraction and unnecessary tables.

---

## 2. Database Technology

| Component | Technology |
|---|---|
| Database engine | PostgreSQL |
| ORM | Drizzle ORM |
| Schema definitions | TypeScript |
| Runtime validation | Zod |
| Database package | `@examinr/db` |
| Migration management | Drizzle Kit |
| Production connectivity | Cloudflare-compatible PostgreSQL connection strategy |

The PostgreSQL provider and connection-management solution remain separate infrastructure decisions.

The database access implementation must be compatible with the Cloudflare Workers runtime.

### Connection management

Database connections must be managed appropriately for serverless execution.

The implementation must consider:

- Connection pooling.
- Runtime compatibility.
- Concurrent requests.
- Connection limits.
- Local development.
- Migration execution.

Cloudflare Hyperdrive is a potential solution for managing PostgreSQL connections from Workers, subject to the selected provider and driver compatibility.

Do not assume that conventional long-lived Node.js database connections can be used unchanged inside Workers.

---

## 3. Database Package Structure

The database package owns schema definitions, database connectivity, migrations, and shared database utilities.

Intended structure:

```text
packages/db/
├── src/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── academic.ts
│   │   ├── institutions.ts
│   │   ├── questions.ts
│   │   ├── examinations.ts
│   │   ├── learning.ts
│   │   ├── achievements.ts
│   │   ├── notifications.ts
│   │   ├── billing.ts
│   │   └── ai-usage.ts
│   │
│   ├── relations/
│   ├── client.ts
│   └── index.ts
│
├── drizzle/
│   └── migrations/
│
├── drizzle.config.ts
└── package.json
```

This is an organisational direction, not a requirement to create every file immediately.

Schema files should be grouped by domain as the implementation grows.

Avoid creating empty schema files or splitting small related tables into excessive numbers of modules.

---

## 4. Data Domains

The database is organised around the following major domains.

| Domain | Responsibility |
|---|---|
| Identity | User accounts and authentication-related records |
| Profiles | Personal and academic user information |
| Academics | Curricula, examination systems, subjects, and topics |
| Institutions | Organisations, memberships, roles, and classes |
| Question Bank | Questions, options, explanations, and content metadata |
| Examinations | Exam configurations, sessions, attempts, and submissions |
| Learning | Practice activity, progress, and study recommendations |
| Analytics | Aggregated student performance and learning insights |
| Achievements | Milestones, awards, and student recognition |
| Notifications | User notifications and delivery records |
| Billing | Plans, subscriptions, payments, and transactions |
| AI Operations | AI request usage, model execution, and cost records |

These domains should remain logically separated even when they share the same PostgreSQL database.

---

## 5. Identity and User Profiles

### 5.1 Users

The users domain represents individuals with Examinr accounts.

A user may be a student, teacher, institution administrator, or platform administrator.

Core user information should include:

- Unique identifier.
- Email address.
- Display name.
- Account status.
- Creation timestamp.
- Last updated timestamp.

Authentication credentials and sessions should be managed according to the selected authentication implementation.

Do not build a parallel password or session system if the chosen authentication library already manages those records.

### 5.2 User Roles

Roles determine the broad category of access a user receives.

Potential roles include:

- Student.
- Teacher.
- Institution administrator.
- Platform administrator.

A user may have different responsibilities in different institutional contexts.

Therefore, institutional roles should not be represented exclusively by one global role field on the user record.

Platform-level privileges must remain distinct from institution-level permissions.

### 5.3 Student Profiles

A student profile contains academic information associated with a user.

Potential fields include:

- User reference.
- Education level.
- Class or grade.
- Selected curriculum.
- Academic preferences.
- Relevant examination goals.

Subjects should be represented through academic relationships rather than stored as an arbitrary list of strings in the profile.

### 5.4 Teacher Profiles

Teacher-specific information should be stored separately when required.

The system should support relationships between teachers, institutions, classes, and assigned students.

### 5.5 Profile Separation

Account identity and academic profile information should remain separate.

Changing a student's academic profile should not require changing their authentication identity.

---

## 6. Academic Structure

The academic domain provides the foundation for organising examination preparation.

### 6.1 Curricula and Examination Systems

Examinr must support multiple curricula and examination systems.

Examples include:

- WAEC.
- NECO.
- JAMB UTME.
- Post-UTME.

These systems must not be treated as interchangeable.

The database should distinguish between:

- A curriculum or academic framework.
- An examination system.
- An examination-specific syllabus or subject structure.

A student may prepare for more than one examination system.

### 6.2 Subjects

Subjects represent academic areas such as Mathematics, English Language, Biology, and Chemistry.

A subject may appear across multiple examination systems.

The database should support shared subject identities while allowing examination-specific metadata and syllabus relationships.

### 6.3 Topics and Subtopics

Topics organise subject content into smaller learning units.

A subject may contain multiple topics, and topics may contain subtopics.

The hierarchy should support:

- Topic names.
- Descriptions.
- Parent-child relationships.
- Ordering.
- Syllabus references.
- Active or archived status.

Avoid hardcoding topic hierarchies into application components.

### 6.4 Student Subject Enrolment

Students should have explicit relationships with the subjects they are studying.

These relationships may include:

- Student reference.
- Subject reference.
- Relevant examination system.
- Selection status.
- Creation timestamp.

This allows students to study overlapping subjects across different examination goals without unnecessary duplication.

---

## 7. Institutions and Memberships

Institutions are independent organisational entities within Examinr.

An institution may have multiple users with different responsibilities.

### 7.1 Institutions

Institution records should contain:

- Unique identifier.
- Institution name.
- Institution type.
- Basic contact information.
- Status.
- Creation timestamp.

Additional institution metadata should be introduced only when required.

### 7.2 Memberships

Institution membership connects users to institutions.

A membership should record:

- User reference.
- Institution reference.
- Institutional role.
- Membership status.
- Joining timestamp.
- Relevant permission metadata.

A user may belong to multiple institutions.

Membership status should distinguish between active, pending, suspended, and removed memberships where applicable.

### 7.3 Classes and Groups

Institutions may organise students into classes or academic groups.

A class should belong to one institution.

Students and teachers should be connected to classes through explicit membership or assignment relationships.

### 7.4 Invitations

Institution invitations should support controlled membership creation.

Invitation records may include:

- Institution reference.
- Invitation token or secure token hash.
- Intended role.
- Expiry timestamp.
- Usage status.
- Creator reference.

Invitation tokens must not be stored or exposed insecurely.

### 7.5 Tenant Isolation

Institutional data must be scoped to the appropriate institution.

Every relevant query must enforce institutional ownership and membership permissions.

Do not rely on the frontend to prevent cross-institution data access.

---

## 8. Question Bank

The question bank stores the academic content used by practice and examinations.

### 8.1 Questions

A question should support:

- Question type.
- Question content.
- Subject.
- Topic.
- Examination association.
- Difficulty metadata.
- Explanation.
- Source or provenance.
- Verification status.
- Creation and update timestamps.

Question content should support structured representations where necessary, including mathematical notation and relevant media.

### 8.2 Question Types

The initial architecture should accommodate:

- Single-choice questions.
- Multiple-choice questions where supported.
- True or false questions.
- Short-answer questions.
- Other structured question types when explicitly required.

Do not assume every examination system supports every question type.

### 8.3 Answer Options

Objective questions should support separately stored answer options.

Options should have:

- Question reference.
- Option content.
- Ordering.
- Correctness metadata.

Correct answers must never be exposed to unauthorised clients before an assessment is submitted.

### 8.4 Explanations

Questions should support explanations that help students understand the reasoning behind an answer.

Explanations may be stored with the question or represented through a related content structure, depending on complexity.

### 8.5 Question Provenance

Question records should distinguish between:

- Officially sourced questions.
- Licensed or approved question content.
- Human-authored questions.
- AI-generated questions.
- Reviewed AI-generated questions.

Source attribution and usage permissions must be preserved.

AI-generated content must not automatically be treated as verified examination material.

### 8.6 Content Versioning

Questions may be revised over time.

An examination attempt should preserve the question content and answer configuration that the student actually encountered.

Changing a question in the question bank must not silently alter the historical record of a completed assessment.

The implementation should use a deliberate versioning or snapshot strategy.

---

## 9. Examinations and Assessment

The examination domain manages assessment configuration, sessions, answers, and results.

### 9.1 Examination Definitions

An examination definition describes an assessment that can be assigned or made available to students.

It may contain:

- Title.
- Description.
- Examination type.
- Subject.
- Duration.
- Question configuration.
- Availability rules.
- Scoring configuration.
- Creator reference.
- Status.

Examination definitions should support practice assessments, timed assessments, and simulated examinations.

### 9.2 Examination Questions

Examinations should reference the questions selected for the assessment.

The system must preserve:

- Question ordering.
- Question configuration.
- Marks.
- Relevant answer rules.
- Question versions or snapshots.

### 9.3 Examination Attempts

An attempt represents one student's participation in an examination.

It should record:

- Student reference.
- Examination reference.
- Start timestamp.
- Submission timestamp.
- Attempt status.
- Score.
- Maximum possible score.
- Relevant timing information.

An attempt must have a clear lifecycle.

Potential states include:

- Created.
- In progress.
- Submitted.
- Automatically submitted.
- Evaluated.
- Invalidated, where appropriate.

The exact lifecycle must be enforced consistently by the backend.

### 9.4 Answers

Each submitted answer should be associated with an examination attempt and question.

Answer records should support:

- Selected option references.
- Text responses.
- Answer submission state.
- Awarded marks.
- Evaluation status.
- Submission timestamps.

The storage structure must accommodate different question types without creating unnecessary nullable fields or ambiguous data.

### 9.5 Results

Results represent the evaluated outcome of an examination attempt.

They should support:

- Total score.
- Maximum score.
- Accuracy.
- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Subject or topic breakdowns where applicable.

Historical results must remain stable even when question-bank content changes.

### 9.6 Submission Integrity

Examination submission must account for:

- Duplicate requests.
- Network interruptions.
- Concurrent updates.
- Late submissions.
- Session expiry.
- Automatic submission.
- Repeated evaluation requests.

Submission operations should be idempotent where appropriate.

A retry must not create duplicate results or award marks multiple times.

---

## 10. Learning and Progress

The learning domain stores information about student activity and academic development.

### 10.1 Practice Sessions

Practice sessions represent non-formal learning activity.

They may be organised by:

- Subject.
- Topic.
- Examination system.
- Difficulty.
- Question type.

Practice sessions should remain distinguishable from formal or simulated examination attempts.

### 10.2 Learning Activity

Relevant activity may include:

- Questions attempted.
- Topics practised.
- Learning sessions completed.
- Study recommendations followed.
- Practice accuracy.
- Learning milestones.

Do not store every minor user interaction indefinitely.

Activity records should have a clear analytical or product purpose.

### 10.3 Topic Progress

Topic progress represents a student's demonstrated understanding of a topic.

It should be based on meaningful evidence such as:

- Practice performance.
- Assessment results.
- Repeated attempts.
- Changes in accuracy.
- Other validated learning signals.

Progress should not be calculated solely from how many times a student opens a topic.

### 10.4 Study Recommendations

Recommendations should be stored when persistence is needed for tracking, continuity, or evaluation.

A recommendation may include:

- Student reference.
- Recommended subject or topic.
- Recommendation type.
- Reason or supporting evidence.
- Priority.
- Status.
- Creation timestamp.
- Expiry or review timestamp.

The system should distinguish between generated recommendations and recommendations that have actually been completed.

---

## 11. Performance Analytics

Performance information should be derived from examination attempts, answers, and relevant learning activity.

### Data sources

- Examination results.
- Question-level responses.
- Practice sessions.
- Topic-level performance.
- Historical progress.

### Aggregated information

The system may maintain derived performance records for efficient retrieval.

Examples include:

- Subject accuracy.
- Topic accuracy.
- Performance trends.
- Attempt counts.
- Improvement over time.
- Weak-area indicators.

Aggregated records must have a clear relationship to their underlying evidence.

Where necessary, derived data should be recalculable.

Avoid treating a cached performance value as the only source of truth when it can be derived from authoritative records.

---

## 12. Achievements

Achievements recognise student milestones and meaningful learning activity.

The database should support:

### Achievement Definitions

Describe available achievements and their qualifying conditions.

### Student Achievement Records

Connect students to achievements they have earned.

Records should include:

- Student reference.
- Achievement reference.
- Award timestamp.
- Relevant evidence or metadata.

Achievement awards should be protected against accidental duplication.

The achievement system should reward meaningful progress rather than arbitrary application usage.

---

## 13. Notifications

The notification domain manages user-facing notifications and their delivery.

### Notification records

A notification may include:

- Recipient reference.
- Notification type.
- Title.
- Content.
- Read status.
- Creation timestamp.
- Relevant resource reference.

### Delivery preferences

Users may have notification preferences for supported delivery channels and notification categories.

These preferences should remain separate from notification records.

Institution-controlled or mandatory notifications must follow their defined rules.

### Delivery records

Where external delivery channels are introduced, delivery attempts and their outcomes should be recorded separately from the original notification.

This helps prevent delivery failures from creating duplicate notifications.

---

## 14. Billing and Subscriptions

Billing data must support both individual subscriptions and institution-managed access.

### Plans

Represent available subscription plans and their associated features or limits.

### Subscriptions

A subscription should record:

- Subscriber reference.
- Plan reference.
- Status.
- Start date.
- Renewal date where applicable.
- Cancellation information.
- Billing ownership.

### Payments

Payment records should preserve transaction information, including:

- Amount.
- Currency.
- Payment status.
- Provider reference.
- Transaction timestamp.
- Related subscription or billing record.

Payment-provider identifiers should be stored without unnecessarily retaining sensitive payment credentials.

### Institution-managed access

Students accessing Examinr through an institution must be distinguishable from individually subscribed students.

Access entitlements should be derived from the appropriate subscription, institutional arrangement, or approved access grant.

The interface must not be the authority for paid-feature access.

---

## 15. AI Usage Records

AI usage records support platform administration, monitoring, and cost management.

Relevant information may include:

- Request identifier.
- User reference where applicable.
- Provider.
- Model.
- Request category.
- Token usage.
- Estimated or reported cost.
- Request status.
- Execution duration.
- Creation timestamp.

Credential records and usage records must remain separate.

Raw provider credentials must never be stored in ordinary usage records or exposed through database queries to unauthorised users.

Detailed credential storage, encryption, routing, and model configuration belong in `AI_SYSTEM.md`.

---

## 16. Relationships and Data Integrity

The database must enforce meaningful relationships between records.

Examples:

- A student profile belongs to a user.
- An institution membership connects a user and institution.
- A class belongs to an institution.
- A subject belongs to an academic structure.
- A topic belongs to a subject.
- A question belongs to an appropriate academic context.
- An examination contains configured questions.
- An examination attempt belongs to a student.
- An answer belongs to an attempt and question.
- A result belongs to an evaluated attempt.
- An achievement record belongs to a student and achievement definition.
- A subscription belongs to an appropriate billing owner.

### Integrity rules

- Use foreign keys for meaningful relationships.
- Add unique constraints where duplicate records are invalid.
- Use appropriate indexes for frequently queried fields.
- Define deletion behaviour deliberately.
- Preserve historical academic records.
- Avoid cascading deletes that unintentionally remove examination history.
- Use transactions for related operations that must succeed together.

---

## 17. Identifier and Timestamp Conventions

### Identifiers

Use consistent primary-key conventions throughout the database.

UUIDs are the preferred direction for records that may be referenced across services or exposed through application APIs.

Identifiers should be generated safely and consistently.

### Timestamps

Relevant records should include appropriate timestamps.

Common fields include:

- `createdAt`
- `updatedAt`
- `deletedAt`, where soft deletion is justified.

Use timezone-aware timestamps and store application times consistently in UTC.

Display localised times in the application layer.

### Status Fields

Use explicit, well-defined status values for entities with lifecycles.

Avoid inconsistent free-form strings.

Status transitions should be validated by application logic and, where appropriate, database constraints.

---

## 18. Indexing and Query Performance

Indexes should reflect actual query patterns.

Potential indexing priorities include:

- User identifiers.
- Email addresses.
- Institution identifiers.
- Membership relationships.
- Subject and topic relationships.
- Examination identifiers.
- Student examination attempts.
- Answer-to-attempt relationships.
- Notification recipients.
- Subscription status.
- AI usage timestamps.

Use composite indexes where queries regularly filter on multiple columns.

Avoid indexing every field by default.

Review query performance before introducing complex database optimisations.

---

## 19. Data Privacy and Retention

Examinr handles personal, academic, and potentially sensitive institutional information.

Data must be protected throughout its lifecycle.

### Requirements

- Store only information required for legitimate product functionality.
- Restrict access to personal and academic records.
- Avoid unnecessary exposure of student data.
- Separate authentication secrets from ordinary profile data.
- Avoid logging sensitive records.
- Apply retention policies where appropriate.
- Support account data export and deletion workflows.
- Preserve records where legally or operationally necessary.

Deleting an account must not automatically destroy institutional or examination records that require retention.

The deletion process should distinguish between personal profile data, account identity, financial records, and academic records.

Detailed privacy and security behaviour should also follow `ARCHITECTURE.md` and the applicable product requirements.

---

## 20. Migrations and Schema Changes

All database schema changes must be version-controlled.

Use Drizzle Kit and the established migration workflow.

### Migration rules

1. Modify the relevant schema definitions.
2. Generate or prepare the corresponding migration.
3. Inspect the generated SQL.
4. Check the impact on existing records.
5. Test the migration in a development environment.
6. Apply it through the approved deployment workflow.
7. Verify the resulting database structure.

Never make undocumented production schema changes.

### Destructive changes

Changes that remove or transform existing data require additional care.

Where necessary:

- Introduce replacement fields first.
- Backfill existing records.
- Update application usage.
- Verify data consistency.
- Remove obsolete fields in a later migration.

Database migrations must remain compatible with the deployment and rollback strategy.

---

## 21. Seed Data and Development Data

Development environments may require seed data for testing.

Seed data should be:

- Clearly identified as non-production.
- Reproducible.
- Safe to reset.
- Consistent with the current schema.
- Free of real student information and production credentials.

Academic seed data should be representative enough to test relevant examination and learning workflows.

Do not mix development seed data with production records.

---

## 22. Open Database Decisions

The following decisions require further specification before final schema implementation.

| Area | Current direction | Status |
|---|---|---|
| Database engine | PostgreSQL | Established |
| ORM | Drizzle ORM | Established |
| Database package | `packages/db` | Established |
| Primary identifiers | UUID | Proposed |
| Authentication schema | Depends on selected auth implementation | Open |
| PostgreSQL provider | Managed PostgreSQL | Open |
| Worker connection strategy | Hyperdrive or compatible alternative | Open |
| Academic content versioning | Preserve historical examination content | Requirement established; implementation open |
| Question sourcing and verification | Track provenance and review status | Requirement established; detailed model open |
| Learning progress calculation | Evidence-based | Requirement established; methodology open |
| Recommendation persistence | Store where continuity and evaluation require it | Proposed |
| Analytics aggregation | Derived records where useful | Proposed |
| Account deletion and retention | Preserve required historical records | Requirement established; policy open |
| Billing provider | To be selected | Open |
| AI usage retention | To be specified | Open |

Do not implement speculative tables or relationships solely because they appear in this document as possible future capabilities.

---

## 23. Relationship to Other Documentation

| Document | Responsibility |
|---|---|
| `PRODUCT.md` | Defines the product requirements and user experiences |
| `ARCHITECTURE.md` | Defines system structure and service boundaries |
| `AI_SYSTEM.md` | Defines AI infrastructure and credential management |
| `DESIGN_SYSTEM.md` | Defines interface conventions |
| `ROADMAP.md` | Defines implementation priorities |
| `PROGRESS.md` | Records actual implementation status |

This document defines the database direction. Exact schema definitions should evolve alongside implementation and must remain consistent with the product and architecture specifications.

---

**End of Database Architecture**