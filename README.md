# Examinr

### Your personal AI-powered examination preparation platform.

Examinr is an AI-powered learning and examination preparation platform designed to help students understand what they know, identify what they need to improve, and prepare more effectively for examinations.

We are starting with the examination systems students prepare for in Nigeria, while building towards a platform that can support O-Level and A-Level qualifications, international examinations such as IELTS, and more.

> **Know what to study. Understand what you know. Improve what matters.**

---

## Our Vision

Examination preparation should be more than memorising information and repeatedly answering questions.

Every student learns differently. Examinr aims to make preparation more intelligent, structured and personalised by helping learners understand their strengths, recognise knowledge gaps and focus their efforts where they matter most.

Our initial focus is Nigeria, but our long-term ambition is to support learners across different curricula, examination systems and educational environments worldwide.

## Examination Coverage

Examinr is being designed to support a growing range of examinations and qualifications.

### Nigerian examinations

- WAEC
- NECO
- JAMB UTME
- Post-UTME examinations
- Other relevant national and regional examinations

### International academic qualifications

- O-Level examinations and qualifications
- A-Level examinations and qualifications
- Other secondary-school and pre-university qualifications

### Language proficiency and professional examinations

Our planned expansion includes:

- IELTS
- Other English-language proficiency examinations
- Additional international language assessments
- Professional and specialised certification examinations

Coverage will expand progressively. Each examination system requires its own syllabus, question formats, assessment rules and content standards; support will be introduced as those requirements are implemented and verified.

## What Examinr Offers

- **Personalised Learning** — Study recommendations informed by a student's goals, progress, practice history and areas of difficulty.
- **Past Questions and Practice** — A structured question bank organised by examination, subject, topic and year, with explanations and marking.
- **Timed Practice and Simulations** — Topic exercises, timed assessments and full-length examination simulations.
- **AI Tutoring** — An AI-powered learning assistant for explanations, guidance and academic support.
- **Performance Insights** — Understand strengths, identify knowledge gaps and track improvement over time.
- **Achievements** — Recognise consistency, milestones and meaningful learning progress.
- **Institution Support** — Tools intended to help schools and educators support and monitor student learning.

## The Learning Cycle

Examinr is built around a continuous learning cycle:

1. **Understand** — Explore subjects, topics and learning materials.
2. **Assess** — Evaluate existing knowledge through questions and assessments.
3. **Identify** — Discover strengths and areas that need improvement.
4. **Recommend** — Receive relevant learning and practice recommendations.
5. **Learn** — Study concepts with structured resources and AI assistance.
6. **Practise** — Reinforce understanding through questions and examinations.
7. **Evaluate** — Review results and measure improvement.
8. **Adapt** — Refine future learning recommendations based on progress.

The objective is not simply to help students answer more questions. It is to help them become better-prepared learners.

## API-Driven Architecture

Examinr is being developed as a modular, API-driven platform. Its dedicated API is intended to serve as the central interface between the web application, internal services and approved integrations.

This architecture gives Examinr room to support future use cases such as:

- School and institutional integrations.
- Third-party educational applications.
- Learning management systems.
- Approved developer integrations.
- Other products that need access to Examinr capabilities.

The API currently forms part of the platform architecture. A public developer API, with its own documentation, authentication, access management and usage limits, is a future capability and should not be considered generally available yet.

## Payments and Subscriptions

Examinr is being designed to support paid plans for individual learners and educational institutions.

The planned payment architecture uses **Polar** for payment processing, alongside Examinr's own application-side billing logic.

Polar is intended to handle payment-provider operations, while Examinr remains responsible for product rules such as:

- Subscription plans and pricing configuration.
- User and institutional entitlements.
- Access control based on subscription status.
- Billing records and payment history.
- Subscription lifecycle handling.
- Secure processing of payment events and webhooks.

This separation allows Examinr to retain control over what each plan includes and what a user is entitled to access. Payment integration and individual billing features will be made available as they are implemented.

## Technology

| Layer | Technology |
|---|---|
| Web application | Next.js, React, TypeScript |
| API | Cloudflare Workers, Hono |
| Real-time infrastructure | Cloudflare Durable Objects |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation and contracts | Zod |
| Monorepo | pnpm, Turborepo |
| AI infrastructure | Internal multi-provider AI gateway |
| Styling | Tailwind CSS |
| Payments | Polar integration (planned) |

The stack reflects the current architectural direction. Individual services and integrations may evolve as implementation progresses.

## Repository Structure

```text
examinr/
├── apps/
│   ├── web/                  # Main web application
│   └── api/                  # Dedicated backend API
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── db/                   # Database schema and access
│   ├── ai/                   # AI gateway and provider integrations
│   └── contracts/            # Shared schemas and API contracts
├── docs/
│   ├── PRODUCT.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── AI_SYSTEM.md
│   ├── DESIGN_SYSTEM.md
│   ├── ROADMAP.md
│   └── PROGRESS.md
├── AGENTS.md
├── CONTRIBUTING.md
├── README.md
└── ...
```

Some package directories represent planned architectural boundaries and may not yet exist in the implementation.

## Getting Started

### Prerequisites

- Node.js (LTS)
- pnpm

### Installation

```bash
git clone https://github.com/Obhahie-Praise/examinr.git
cd examinr
pnpm install
pnpm dev
```

Environment variables and service-specific setup may be required as integrations are implemented. See the project documentation for the current development direction.

## Documentation

| Document | Purpose |
|---|---|
| [Product](docs/PRODUCT.md) | Product vision, users, features and V1 scope |
| [Architecture](docs/ARCHITECTURE.md) | System architecture, services and application boundaries |
| [Database](docs/DATABASE.md) | Data model, entities, relationships and migrations |
| [AI System](docs/AI_SYSTEM.md) | AI infrastructure, providers, routing and usage |
| [Design System](docs/DESIGN_SYSTEM.md) | Visual identity, components and interface conventions |
| [Roadmap](docs/ROADMAP.md) | Development phases, priorities and planned work |
| [Progress](docs/PROGRESS.md) | Product milestones and implementation status |
| [Notion Development Progress Sync](docs/NOTION_PROGRESS_SYNC.md) | Secure server-to-server project development updates to Notion |
| [Notion Study Progress Sync](docs/NOTION_STUDY_PROGRESS_SYNC.md) | Secure learner study-session updates to Notion |

## Development Principles

- **Student-first:** Every feature should contribute to a meaningful learning outcome.
- **Personalisation over generic experiences:** Learning should adapt to the student.
- **Modular architecture:** Keep application boundaries clear and maintainable.
- **Type safety:** Prefer strict TypeScript, shared contracts and validated data.
- **Security by design:** Protect student information, credentials and institutional data.
- **Practical infrastructure:** Prioritise reliable, cost-conscious solutions without unnecessary complexity.
- **Responsible AI:** Treat generated educational content carefully and distinguish generated material from verified examination content.
- **Accurate documentation:** Keep project decisions and implementation status aligned with the codebase.

## Project Status

**In active development.**

Examinr is being built progressively, starting with its core student learning and examination preparation experience. Examination coverage, integrations and platform capabilities will expand as they are implemented and tested.

## Licence

The source code in this repository is proprietary. All rights are reserved by the rights holder. Viewing the public repository does not grant permission to reuse, modify, distribute or commercially exploit the code.

See [LICENSE](LICENSE) for the full terms. Third-party dependencies and assets remain subject to their respective licences.
