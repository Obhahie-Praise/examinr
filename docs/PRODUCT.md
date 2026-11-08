# Examinr — Product Specification

> The product source of truth for Examinr. Defines what we are building, who we are building it for, and the experiences the platform must deliver.

**Status:** Living specification  
**Product:** Examinr  
**Initial market:** Nigeria

---

## 1. Product Overview

Examinr is an AI-powered examination preparation and personalised learning platform designed to help students prepare more effectively, understand their academic strengths and weaknesses, and make measurable progress towards their examination goals.

The platform combines structured learning, examination practice, AI-assisted tutoring, performance analysis, and personalised study recommendations into one connected experience.

Examinr is not simply a question bank or an AI chatbot. It is intended to support the student's entire examination preparation journey, from understanding what to study to evaluating progress and deciding what to do next.

### Core proposition

**Examinr helps every student understand what they need to learn, how well they understand it, and what they should focus on next.**

### Product objectives

1. Make examination preparation more structured and less overwhelming.
2. Help students identify knowledge gaps before examinations.
3. Personalise learning based on academic goals and demonstrated performance.
4. Make high-quality examination practice more accessible.
5. Turn performance data into useful, actionable learning recommendations.
6. Give teachers and educational institutions better ways to support student progress.

---

## 2. Target Users

Examinr serves three primary user groups.

### 2.1 Students

Students are the primary users and the centre of the product experience.

They use Examinr to:

- Prepare for examinations.
- Study subjects and topics.
- Practise examination-style questions.
- Understand difficult concepts.
- Identify weak areas.
- Track academic performance.
- Receive personalised study recommendations.
- Monitor preparation progress.
- Work towards academic goals.

The student experience must remain intuitive, motivating, and focused on actual learning outcomes.

### 2.2 Teachers

Teachers use Examinr to support student learning and examination preparation.

Their intended capabilities include:

- Managing assigned classes or student groups.
- Supporting students' learning activities.
- Creating or managing assessments where permitted.
- Reviewing relevant student performance.
- Identifying common learning difficulties.
- Monitoring progress within their assigned groups.

Teacher access must respect institutional permissions and student-data boundaries.

### 2.3 Educational Institutions

Schools and other educational organisations use Examinr to provide a more structured learning and examination preparation environment.

Their intended capabilities include:

- Managing institutional profiles.
- Inviting and managing students and teachers.
- Organising classes and academic groups.
- Assigning examinations or learning activities.
- Monitoring institutional academic performance.
- Managing announcements and relevant communications.
- Configuring institution-specific settings and permissions.

Institutional functionality must be designed around clear roles, permissions, and ownership of academic records.

---

## 3. Initial Market and Examination Focus

Examinr's initial market is Nigeria.

The product should support Nigerian students preparing for relevant secondary-school and tertiary-entry examinations.

Initial examination priorities include:

| Examination | Purpose |
|---|---|
| WAEC | Senior secondary school certification |
| NECO | Senior secondary school certification |
| JAMB UTME | University and other tertiary institution admission |
| Post-UTME | Institution-specific admission screening |

These examination systems have different structures, syllabuses, question formats, and assessment requirements. They must not be treated as interchangeable.

### Academic structure

The platform should support a consistent academic hierarchy:

**Curriculum / Examination → Subjects → Topics → Learning content and questions**

A student may prepare for multiple examination systems, and subjects or topics may overlap between them.

The system should avoid unnecessary duplication while preserving examination-specific requirements.

The product should remain extensible to additional curricula and examination systems beyond Nigeria.

---

## 4. Core Product Experience

The student experience should follow a continuous learning cycle.

1. **Understand:** Establish the student's academic level, examination goals, subjects, and preparation needs.
2. **Assess:** Determine existing knowledge through practice and assessment.
3. **Identify:** Detect strengths, weaknesses, and topics requiring attention.
4. **Recommend:** Suggest relevant learning activities and study priorities.
5. **Learn:** Provide explanations, learning materials, and AI-assisted support.
6. **Practise:** Reinforce understanding through questions and examinations.
7. **Evaluate:** Analyse results and changes in performance.
8. **Adapt:** Use new evidence to improve future recommendations.

This cycle is central to Examinr's product direction.

A student should not have to independently interpret every result and decide what to study next. Examinr should help turn academic performance into the next useful learning action.

---

## 5. Core Product Modules

### 5.1 Student Home

The student home experience is the central entry point into Examinr.

It should provide a useful overview of the student's current academic preparation.

Relevant information includes:

- Current examination goals.
- Study recommendations.
- Subjects and topics requiring attention.
- Recent performance.
- Upcoming examinations or activities.
- Learning progress.
- Relevant achievements.
- Important notifications.

The home experience should prioritise actionable information rather than simply displaying statistics.

### 5.2 Subjects and Topics

Students need a structured way to navigate their academic content.

The subject experience should support:

- Enrolled or selected subjects.
- Topic and subtopic organisation.
- Topic-level progress.
- Relevant learning resources.
- Related practice questions.
- Topic-specific performance.

Subject and topic structures should be compatible with the relevant examination syllabuses.

### 5.3 Personalised Learning

Personalised learning is one of Examinr's defining capabilities.

The platform should use information such as:

- Student goals.
- Selected examination systems.
- Subject and topic performance.
- Practice history.
- Assessment results.
- Learning activity.
- Repeated errors.
- Demonstrated understanding.

This information should help determine what the student should focus on next.

Recommendations must be explainable enough for students to understand why a particular topic or activity is being suggested.

Personalisation should improve as more learning evidence becomes available.

### 5.4 Practice and Examinations

Examinr should provide structured examination preparation through questions, practice sessions, and assessments.

Expected capabilities include:

- Subject-based practice.
- Topic-based practice.
- Examination-style questions.
- Timed assessments.
- Full examination simulations.
- Question navigation.
- Answer submission.
- Result calculation.
- Performance breakdowns.

Examination behaviour should respect the rules of the selected examination format.

The system must distinguish between practice sessions, formal assessments, and simulated examinations where their rules or outcomes differ.

### 5.5 AI Chat and Tutoring

Examinr includes an AI-powered academic assistant.

Students should be able to use it to:

- Ask academic questions.
- Request explanations.
- Understand difficult topics.
- Explore alternative explanations.
- Get guidance on solving problems.
- Receive help understanding mistakes.
- Get relevant study guidance.

The assistant should support learning rather than simply provide answers.

Where appropriate, responses should consider the student's academic level, selected examination system, subject, and learning context.

AI-generated educational information must be handled carefully. The platform should not present uncertain or unverified information as guaranteed examination content.

### 5.6 Performance and Analytics

Students should be able to understand their academic performance beyond a single examination score.

Relevant indicators include:

- Overall performance.
- Subject performance.
- Topic-level performance.
- Accuracy.
- Attempt history.
- Areas of improvement.
- Recurring mistakes.
- Preparation progress.

Performance insights should help students understand what is improving, what remains difficult, and what action would be useful next.

### 5.7 Achievements

Achievements recognise meaningful student activity and progress.

Potential achievement categories include:

- Consistency.
- Practice milestones.
- Examination milestones.
- Learning progress.
- Subject mastery.
- Personal improvement.

Achievements should reinforce productive learning behaviour rather than reward activity without educational value.

### 5.8 Institutions

The institution experience supports schools and educational organisations using Examinr.

It should provide appropriate tools for:

- Institution management.
- Student and teacher membership.
- Class organisation.
- Academic activities.
- Assignments and assessments.
- Announcements.
- Institutional performance insights.

Access must be controlled through institution membership, assigned roles, and permissions.

A student should understand what information their institution can access.

---

## 6. Student Account and Settings

Profile and Settings are one destination within the student experience.

The settings experience is organised into the following sections:

| Section | Responsibility |
|---|---|
| Profile | Personal identity and academic profile |
| Account | Login information and account management |
| Preferences | Appearance, study, learning, and examination preferences |
| Notifications | Notification types and delivery channels |
| Billing | Subscription, payment methods, and billing history |
| Help & Support | Support requests and ticket history |
| Privacy & Security | Data controls, security, and account protection |
| Institutions | Institutional memberships and related settings |

### Important product rules

- Academic subjects belong in the Subjects experience rather than being treated as simple profile metadata.
- Institution-assigned information and permissions may be read-only for students.
- Institution-managed billing must be distinguishable from individually managed subscriptions.
- Institutional notifications may be mandatory or controlled by the institution.
- Learning preferences represent student choices, while the personalisation system should also learn from actual behaviour.
- Adaptive difficulty should be the default learning direction.
- Examination rules imposed by an examination or institution must take precedence over conflicting user preferences.

---

## 7. Personalisation and Learning Intelligence

Examinr's personalisation system should be based on evidence rather than arbitrary recommendations.

### Sources of learning evidence

- Assessment results.
- Question-level responses.
- Topic-level accuracy.
- Practice frequency.
- Repeated mistakes.
- Time spent on learning activities, where meaningful.
- Changes in performance over time.

### Expected outcomes

The system should progressively become better at:

- Identifying weak topics.
- Prioritising learning activities.
- Recommending relevant practice.
- Adjusting difficulty.
- Highlighting improvement.
- Helping students plan their preparation.

### Important distinction

A student's stated preference and demonstrated ability are not necessarily the same thing.

For example, a student may prefer easy questions but consistently perform well on difficult ones. Examinr should be able to adapt to demonstrated ability while respecting the student's learning preferences.

Personalisation must remain understandable and should not create misleading claims about a student's academic ability.

---

## 8. Monetisation and Access

Examinr is intended to follow a premium-oriented product direction.

The platform should offer meaningful value through its learning and examination preparation capabilities rather than relying on an excessively large free tier.

The product must support different access arrangements:

- Individually subscribed students.
- Students using institution-managed access.
- Other approved access arrangements as the product develops.

### Billing principles

- Students should clearly understand their current plan.
- Subscription inclusions must be transparent.
- Payment history should be accessible.
- Institution-managed access should be represented accurately.
- Access to paid functionality must be enforced by the backend, not merely hidden in the interface.

Exact pricing, plan names, usage limits, and payment-provider decisions belong in a later product and business decision.

---

## 9. Product Principles

These principles should guide product decisions and implementation.

### Student-first

The student is the primary beneficiary of Examinr. Features should contribute to a meaningful improvement in the learning experience.

### Personalisation over generic experiences

Students have different abilities, goals, and learning needs. The product should adapt rather than assume every student needs the same preparation path.

### Actionable insights

Displaying data is not enough. Performance information should help students understand what to do next.

### Examination relevance

Learning materials, questions, and assessments should respect the requirements of their selected examination systems.

### Trust and educational reliability

Student data must be protected, and educational content must be handled responsibly.

### Progressive complexity

The product should make powerful functionality accessible without overwhelming students with unnecessary controls.

### Connected experiences

Learning, practice, AI assistance, examinations, and performance analysis should work together rather than behave like unrelated products.

---

## 10. V1 Scope

V1 should establish the complete foundation of the student learning and examination preparation experience while keeping implementation manageable.

### Core priorities

- Student account and academic profile.
- Examination and subject selection.
- Subject and topic navigation.
- Personalised student home.
- Practice questions and examination sessions.
- Answer evaluation and result generation.
- Performance and weak-area analysis.
- AI academic assistance.
- Study recommendations.
- Student settings and account management.
- Core achievements.
- Foundation for institutional membership and permissions.
- Administrative infrastructure for managing the platform and AI services.

### Scope discipline

The existence of a module in this specification does not mean every possible feature within it must ship in V1.

Prioritise the smallest complete experience that delivers the intended learning outcome.

Features should not be implemented merely because they are listed as potential capabilities.

Detailed implementation priorities and milestone sequencing belong in `ROADMAP.md`.

---

## 11. Out of Scope for Initial Implementation

Unless explicitly prioritised later, avoid expanding the initial product into:

- A full learning management system for every educational workflow.
- A replacement for school administration software.
- Automated school admissions.
- Automated examination registration.
- Unrelated social networking functionality.
- Unrestricted AI-generated examination predictions presented as guaranteed questions.
- Features that do not contribute meaningfully to learning, assessment, or educational operations.

Future possibilities should not become V1 requirements without an explicit product decision.

---

## 12. Success Indicators

Examinr should measure success through meaningful student outcomes and product engagement.

Potential indicators include:

| Area | Indicator |
|---|---|
| Activation | Students who complete onboarding and begin learning |
| Engagement | Meaningful study and practice activity |
| Learning | Improvement in topic-level accuracy |
| Retention | Students who return and continue preparing |
| Personalisation | Recommendations that lead to useful learning activity |
| Examination readiness | Progress across relevant subjects and topics |
| Institutions | Active institutions and engaged student populations |
| Reliability | Successful examination sessions and answer submissions |

Usage metrics should be interpreted carefully. More time spent in the application does not automatically mean more learning.

---

## 13. Product Decisions and Open Questions

This section records decisions that require further definition rather than silently turning assumptions into requirements.

| Area | Current direction | Status |
|---|---|---|
| Initial market | Nigeria | Established |
| Primary user | Student | Established |
| Other user groups | Teachers and institutions | Established |
| Initial examination focus | WAEC, NECO, JAMB UTME, Post-UTME | Established direction |
| Product positioning | Premium-oriented | Established direction |
| Learning approach | Personalised and adaptive | Established direction |
| Student settings | Eight defined sections | Established |
| Exact subscription plans | To be defined | Open |
| Payment provider | To be decided | Open |
| Detailed V1 feature boundaries | To be refined in roadmap | Open |
| Achievement rules | To be specified | Open |
| Teacher and institution V1 capabilities | To be prioritised | Open |
| Examination content sourcing and verification | To be specified | Open |
| Recommendation evaluation methodology | To be specified | Open |

New decisions should be reflected in this document when they materially change the product.

---

## 14. Relationship to Other Documentation

This document defines the product requirements. It does not prescribe every technical implementation detail.

| Document | Responsibility |
|---|---|
| `ARCHITECTURE.md` | How the platform is structured and implemented |
| `DATABASE.md` | How product information is represented and stored |
| `AI_SYSTEM.md` | How AI-powered capabilities operate |
| `DESIGN_SYSTEM.md` | How the product looks and behaves |
| `ROADMAP.md` | What gets built and in what order |
| `PROGRESS.md` | What has actually been implemented |

When implementing a feature, use this document to understand the intended product behaviour and the relevant technical documents to determine how to build it.

---

**End of Product Specification**