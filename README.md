# Examinr

### Your personal AI-powered exam preparation platform.

Examinr helps students prepare smarter, understand what they need to improve, and make measurable progress towards their academic goals.

Rather than giving every student the same study experience, Examinr combines personalised learning, intelligent practice, and performance insights to make exam preparation more focused and effective.

> **Know what to study. Understand what you know. Improve what matters.**

---

## What is Examinr?

Examinr is an AI-powered learning and examination platform built with students, teachers, and educational institutions in mind.

It brings together the tools students need throughout their preparation journey:

- **Personalised Learning** — Study recommendations shaped around each student's goals, progress, and areas of difficulty.
- **Practice & Examinations** — Structured practice questions, assessments, and exam simulations.
- **AI Tutoring** — An intelligent learning assistant for explanations, guidance, and academic support.
- **Performance Insights** — Understand strengths, identify knowledge gaps, and track improvement over time.
- **Achievements** — Recognise consistency, milestones, and learning progress.
- **Institution Support** — Give schools and educators tools to support, monitor, and manage student learning.

## Our Direction

Examinr is being built around one central idea:

**Students should not have to figure out what they need to learn next on their own.**

The platform should understand a student's learning journey and help them make better decisions about what to study, how to practise, and where to focus their attention.

Our initial focus is Nigerian students and the examination systems they prepare for, with room to support a wider range of curricula and educational environments over time.

## Technology

| Layer | Technology |
|---|---|
| Web application | Next.js, React, TypeScript |
| API | Cloudflare Workers, Hono |
| Real-time infrastructure | Cloudflare Durable Objects |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation & contracts | Zod |
| Monorepo | pnpm, Turborepo |
| AI infrastructure | Custom multi-provider AI gateway |
| Styling | Tailwind CSS |

*The stack reflects the current architectural direction and may evolve as implementation progresses.*

## Repository Structure

```text
examinr/
├── apps/
│   ├── web/                  # Main web application
│   └── api/                  # Backend API
│
├── packages/
│   ├── ui/                   # Shared UI components
│   ├── db/                   # Database schema and access
│   ├── ai/                   # AI gateway and provider integrations
│   └── contracts/            # Shared schemas and API contracts
│
├── docs/
│   ├── PRODUCT.md            # Product vision, users and scope
│   ├── ARCHITECTURE.md       # System design and application boundaries
│   ├── DATABASE.md           # Data model and database decisions
│   ├── AI_SYSTEM.md          # AI gateway, providers and routing
│   ├── DESIGN_SYSTEM.md      # UI foundations and design conventions
│   ├── ROADMAP.md            # Planned milestones and priorities
│   └── PROGRESS.md           # Current implementation status
│
├── AGENTS.md                 # Instructions for coding agents
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Enter the project
cd examinr

# Install dependencies
pnpm install

# Start the development environment
pnpm dev
```

*Environment variables and service-specific setup instructions will be documented as the relevant integrations are implemented.*

## Documentation

The `docs/` directory contains the project's core product and technical documentation.

| Document | Purpose |
|---|---|
| [`PRODUCT.md`](docs/PRODUCT.md) | Product vision, users, features and V1 scope |
| [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture, services and application boundaries |
| [`DATABASE.md`](docs/DATABASE.md) | Database design, entities, relationships and migrations |
| [`AI_SYSTEM.md`](docs/AI_SYSTEM.md) | AI infrastructure, model providers, routing and usage |
| [`DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Visual identity, components and interface conventions |
| [`ROADMAP.md`](docs/ROADMAP.md) | Development phases, priorities and planned work |
| [`PROGRESS.md`](docs/PROGRESS.md) | Completed work, active tasks and known issues |

## Development Principles

Examinr is being developed with a few principles in mind:

- **Student-first:** Every feature should contribute to a meaningful learning outcome.
- **Personalisation over generic experiences:** Learning should adapt to the student, not the other way around.
- **Modular architecture:** Keep application boundaries clear and systems independently maintainable.
- **Type safety:** Prefer strict TypeScript, shared contracts, and validated data.
- **Security by design:** Protect student information, credentials, and institutional data.
- **Practical infrastructure:** Prioritise reliable, cost-conscious solutions without unnecessary complexity.
- **Useful documentation:** Keep project decisions and implementation status accurate without creating documentation overhead.

## Project Status

**Status: In Active Development**

Examinr is currently in its foundation and implementation phase. Core infrastructure, product systems, and application experiences are being established.

Features and architectural decisions may change as the product develops.

---

## License

License information will be added before public distribution.

---

<p align="center">
  Built with purpose. Designed to help students do better.
  <br />
  <strong>Examinr</strong>
</p>