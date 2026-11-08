# Design System

## 1. Purpose

The Examinr design system defines the visual language and interface standards used throughout the platform.

It exists to ensure that every part of Examinr feels like one coherent product, regardless of the feature, user role, or screen.

The design system should guide:

- Visual identity.
- Colour and typography.
- Layout and spacing.
- Navigation.
- Reusable components.
- Forms and interactions.
- Data visualisation.
- Responsive behaviour.
- Accessibility.
- Loading, empty, success, and error states.

The system should be implemented through reusable design tokens and components rather than duplicated styling across individual pages.

## 2. Design Direction

Examinr should feel like a premium, modern learning platform.

The interface should communicate:

- Clarity.
- Intelligence.
- Focus.
- Progress.
- Reliability.
- Approachability.

The visual experience should balance the seriousness of examination preparation with the accessibility of a modern digital learning product.

### Design principles

**Clarity over decoration**

Every visual element should help users understand information or complete an action.

**Content first**

Learning materials, questions, explanations, and performance information should receive the strongest visual emphasis.

**Consistent interaction**

Similar actions should behave and appear consistently across the platform.

**Purposeful simplicity**

Avoid unnecessary gradients, decorative illustrations, excessive borders, and complicated layouts.

**Progressive disclosure**

Show important information first. Reveal advanced controls and secondary details when needed.

**Responsive by default**

Every major interface should work across desktop, tablet, and mobile screens.

## 3. Visual Identity

Examinr should have a recognisable visual identity that can extend across its web application, marketing materials, and future products.

The identity should avoid looking like a generic school management system or an ordinary chatbot interface.

### Brand characteristics

| Attribute | Direction |
|---|---|
| Personality | Intelligent, focused, approachable |
| Visual style | Minimal, modern, editorial |
| Layout | Structured and spacious |
| Typography | Clean, highly readable |
| Colour | Restrained with a recognisable primary accent |
| Components | Consistent, refined, functional |
| Motion | Subtle and purposeful |

The visual identity should be expressed through the interface itself rather than relying on decorative branding.

## 4. Colour System

Use semantic colour tokens instead of hardcoding colours throughout the application.

The initial palette should be neutral-led, with a distinctive primary accent.

### Colour roles

| Token | Purpose |
|---|---|
| `background` | Main application background |
| `foreground` | Primary text |
| `surface` | Cards, panels, and elevated sections |
| `surface-muted` | Secondary backgrounds |
| `border` | Dividers and component boundaries |
| `primary` | Main brand actions and emphasis |
| `primary-foreground` | Text and icons on primary surfaces |
| `secondary` | Secondary actions and emphasis |
| `muted` | Supporting text and subdued elements |
| `success` | Successful states and positive feedback |
| `warning` | Cautionary states |
| `destructive` | Errors and dangerous actions |
| `info` | Informational states |

### Rules

- Maintain sufficient contrast between text and backgrounds.
- Use semantic colours consistently.
- Avoid using colour as the only indicator of meaning.
- Keep status colours restrained.
- Do not introduce a new colour for an individual page without a system-level reason.
- Support dark and light themes only when both can be maintained consistently.

The exact palette and colour values should be established as design tokens during visual implementation.

## 5. Typography

Typography must support long study sessions, examination questions, explanations, and data-heavy dashboards.

Use a consistent type scale.

### Typography hierarchy

| Level | Usage |
|---|---|
| Display | Major landing-page or promotional headings |
| H1 | Main page heading |
| H2 | Major section heading |
| H3 | Subsection heading |
| H4 | Card and panel heading |
| Body | Standard interface content |
| Small | Supporting information |
| Caption | Metadata and secondary labels |

### Rules

- Use a consistent font family throughout the application.
- Maintain readable line lengths.
- Avoid excessive font-weight variation.
- Use clear hierarchy rather than relying on colour alone.
- Use tabular numerals for scores, statistics, and other aligned numeric values where appropriate.
- Mathematical expressions, symbols, and scientific notation must remain readable.

The final font family and exact type scale should be defined in the implementation tokens.

## 6. Spacing and Layout

Use a consistent spacing scale.

Avoid arbitrary spacing values when an existing token can achieve the same result.

### Layout principles

- Group related information.
- Separate unrelated sections clearly.
- Use whitespace to establish hierarchy.
- Avoid overcrowding dashboards.
- Keep important actions easy to locate.
- Use consistent content widths.
- Maintain predictable alignment across pages.

### Responsive behaviour

The interface should adapt to:

- Desktop: full navigation and multi-column layouts where appropriate.
- Tablet: simplified layouts with reduced column counts.
- Mobile: compact navigation, single-column content, and touch-friendly controls.

Do not simply shrink desktop layouts to fit mobile screens. Reorganise content based on the available space.

## 7. Navigation

Navigation should make Examinr's main learning workflows easy to access.

The primary student experience should prioritise:

- Home.
- Study and learning.
- Practice and examinations.
- Performance and progress.

Secondary destinations should remain accessible without competing with the main learning workflow.

These include:

- AI Chat.
- Achievements.
- Institutions.
- Profile and settings.

Navigation should adapt to the user's role and permissions.

### Navigation rules

- Maintain consistent navigation across authenticated pages.
- Clearly identify the current location.
- Avoid duplicate destinations.
- Keep secondary actions in appropriate menus.
- Preserve access to important navigation on smaller screens.
- Do not expose administrative or institutional controls to users without the required permissions.

## 8. Component Standards

Reusable components should be implemented in the shared UI package where appropriate.

Components should have consistent variants, sizes, states, and accessibility behaviour.

### Core components

**Buttons**

Support primary, secondary, outline, ghost, and destructive variants where appropriate.

Button states must include default, hover, focus, active, disabled, and loading.

**Cards**

Use cards to group related information, not simply to place every element inside a bordered container.

**Inputs**

Support labels, descriptions, validation messages, disabled states, and clear focus indicators.

**Selects and dropdowns**

Use for controlled choices and contextual actions. Avoid unnecessarily long dropdown lists.

**Dialogs and drawers**

Use for focused tasks, confirmations, and secondary workflows. Do not use them for information that deserves a dedicated page.

**Tabs**

Use when switching between closely related sections within the same context.

**Badges**

Use for statuses, categories, and compact metadata. Avoid excessive badges.

**Tooltips**

Use to explain unfamiliar controls or provide supplementary context. Essential information must remain visible without a tooltip.

**Tables**

Use for structured, comparable information. Provide responsive alternatives when tables become difficult to use on smaller screens.

**Progress indicators**

Use for learning progress, examination completion, and multi-step workflows.

**Skeletons**

Use for predictable loading layouts. Avoid replacing every loading state with a generic spinner.

## 9. Learning Interface

Learning is Examinr's primary purpose. Its interface requires special attention.

### Study experience

The study interface should:

- Keep the selected subject and topic clear.
- Present explanations in readable sections.
- Support headings, lists, examples, formulas, and diagrams where appropriate.
- Make navigation between related topics straightforward.
- Provide access to relevant practice activities.
- Avoid unnecessary interface distractions.

### Practice and examinations

The examination interface should prioritise concentration and clarity.

It should support:

- Clear question presentation.
- Question numbering.
- Answer selection and input.
- Question navigation.
- Progress tracking.
- Marking questions for review where supported.
- Clear submission and confirmation flows.
- Visible examination instructions and timing where applicable.

Do not introduce unnecessary animations or distracting elements during timed examinations.

### Results

Results should make it easy to understand:

- Overall performance.
- Correct and incorrect answers.
- Topic-level strengths and weaknesses.
- Explanations and corrections.
- Recommended next steps.

Avoid presenting a score without meaningful context.

## 10. AI Interface

AI features should feel integrated into Examinr rather than like a separate generic chatbot.

### AI tutoring

- Make the conversation easy to read.
- Distinguish student messages from AI responses.
- Render mathematical and scientific content properly.
- Support structured explanations.
- Indicate when a response is being generated.
- Provide clear error and retry states.
- Preserve conversation context where supported.

### AI-generated content

Generated questions, explanations, and recommendations should use the same visual standards as other learning content.

Where appropriate, distinguish AI-generated or unverified content from verified learning material.

Do not imply that AI output is automatically correct.

## 11. Data Visualisation

Performance information should be understandable at a glance.

Use charts only when they communicate something more effectively than a simple number or comparison.

Suitable visualisations include:

- Performance over time.
- Subject-level comparisons.
- Topic mastery.
- Examination history.
- Study activity.
- Progress towards learning goals.

### Rules

- Give every chart a clear title.
- Label axes and values where needed.
- Use consistent colours and scales.
- Provide text alternatives or supporting summaries.
- Avoid misleading visual scales.
- Do not rely solely on colour to distinguish data.
- Keep charts readable on mobile.

## 12. Feedback and Interface States

Every interactive component must account for its different states.

### Loading

Show that an action is processing and prevent accidental duplicate submissions where necessary.

### Empty

Explain why no content is present and provide a relevant next action when possible.

### Error

Use clear, actionable messages. Avoid exposing internal errors or technical implementation details.

### Success

Confirm important completed actions without unnecessary interruption.

### Disabled

Make unavailable actions visually distinguishable and explain the reason when it is not obvious.

### Offline or connection issues

Where network availability affects a workflow, communicate the issue clearly and preserve user input where possible.

## 13. Forms and Validation

Forms should be predictable and easy to complete.

- Use clear labels.
- Group related fields.
- Indicate required fields.
- Validate input appropriately.
- Display errors close to the relevant field.
- Preserve valid input when submission fails.
- Avoid asking users for information Examinr already has.
- Use confirmation steps for destructive or consequential actions.

Validation should be consistent between the frontend and backend.

## 14. Accessibility

Accessibility is a core requirement, not a later enhancement.

The interface should aim for WCAG 2.2 AA where practical.

Requirements include:

- Semantic HTML.
- Keyboard navigation.
- Visible focus indicators.
- Appropriate text contrast.
- Accessible form labels.
- Screen-reader-friendly controls.
- Meaningful alternative text for informative images.
- Reduced-motion support.
- Touch-friendly interactive targets.
- Clear error announcements.

Do not use visual styling that makes interactive elements indistinguishable from ordinary text.

## 15. Motion and Animation

Motion should improve understanding, feedback, and navigation.

Appropriate uses include:

- Subtle transitions.
- Dropdown and dialog transitions.
- Progress feedback.
- Loading indicators.
- Small interaction confirmations.

Avoid:

- Excessive page transitions.
- Constant decorative animation.
- Unnecessary movement during examinations.
- Animations that interfere with accessibility.
- Motion that delays important actions.

Respect the user's reduced-motion preference.

## 16. Icons and Illustrations

Use a consistent icon library, preferably Lucide, for interface icons.

Rules:

- Use icons with clear meaning.
- Maintain consistent sizing and stroke weight.
- Pair unfamiliar icons with labels.
- Avoid decorative icons that add no information.
- Use illustrations only when they improve comprehension or meaning.
- Avoid inconsistent illustration styles.

**No emojis should be used anywhere in Examinr**, including interface copy, documentation, empty states, notifications, and system messages.

## 17. Design Tokens and Implementation

The design system should be implemented through shared tokens and reusable components.

Recommended token categories:

```text
design-tokens/
├── colors
├── typography
├── spacing
├── radius
├── shadows
├── borders
├── breakpoints
├── motion
└── z-index
```

These are logical categories, not a requirement to create separate files for each token group.

The shared UI package should contain reusable components and their variants.

Application-specific components should remain within their relevant application features until reuse is justified.

### Implementation rules

- Prefer design tokens over hardcoded values.
- Avoid duplicated component implementations.
- Keep component APIs predictable.
- Use strict TypeScript.
- Support keyboard and screen-reader interaction.
- Keep styling consistent with the existing Tailwind setup.
- Avoid introducing additional UI libraries without a clear need.

## 18. Design Quality Checklist

Before considering a screen complete, review the following:

- Does the screen have a clear purpose?
- Is the most important information visually prioritised?
- Is the layout consistent with the rest of Examinr?
- Are spacing and typography consistent?
- Are interactions predictable?
- Are loading, empty, error, and success states handled?
- Does it work on mobile?
- Is it keyboard accessible?
- Is the contrast sufficient?
- Does it avoid unnecessary visual decoration?
- Does it follow the no-emoji rule?

## 19. Open Decisions

The following details should be finalised during design implementation:

- Exact brand colour palette.
- Final font family and typography scale.
- Light and dark theme support.
- Exact spacing and radius tokens.
- Navigation behaviour on mobile.
- Charting library.
- Component documentation and visual testing approach.
- Final icon sizing and illustration guidelines.

Do not invent separate visual rules for individual pages when a shared system decision is more appropriate.

---

## Final Principle

Examinr should feel like one carefully designed learning environment, not a collection of unrelated dashboards.

Every design decision should make learning clearer, reduce friction, or help students understand their progress.