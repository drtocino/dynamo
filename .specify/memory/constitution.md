<!--
  Sync Impact Report
  ═══════════════════════════════════════════════════════
  Version change: (none) → 1.0.0 (initial ratification)

  Principles established:
    I.   Wholesome & Safe Environment
    II.  Extensible Games Platform
    III. Multiplayer-First Design
    IV.  Reusable & Composable Architecture
    V.   Content–Logic Separation
    VI.  Simplicity & Fast Onboarding
    VII. Neobrutalist Visual Identity
    VIII. Maintainability & Pragmatic Engineering

  Added sections:
    - Core Principles (8 principles)
    - Design & Content Standards
    - Development Standards
    - Governance

  Removed sections: (none — initial creation)

  Templates requiring updates:
    ✅ plan-template.md — Constitution Check section is generic;
       gates will be derived from these principles at plan time.
    ✅ spec-template.md — Generic; no constitution-specific
       sections require injection at template level.
    ✅ tasks-template.md — Generic; principle-driven task types
       (content safety, accessibility, visual identity) will be
       applied during task generation.

  Follow-up TODOs: none
  ═══════════════════════════════════════════════════════
-->

# Dynamo Constitution

## Core Principles

### I. Wholesome & Safe Environment

The platform MUST provide a wholesome, respectful, and
Christian-appropriate environment for youth at all times.

- All content — text, imagery, audio, game themes, and social
  interactions — MUST be appropriate for youth audiences.
- Language, themes, and visuals MUST be free of violence, profanity,
  sexual content, gambling mechanics, and any form of bullying or
  harassment.
- Content moderation policies MUST be established and enforced for
  any user-generated or user-facing content.
- Features that could expose youth to unsupervised contact with
  strangers MUST NOT be implemented without explicit safeguards.

**Rationale**: Dynamo exists to serve church youth groups and
Christian gatherings. The safety and wholesomeness of the environment
is the foundational promise to parents, youth leaders, and the
communities that adopt the platform.

### II. Extensible Games Platform

The platform MUST be designed as an extensible games platform where
new games and game content can be added without compromising or
restructuring the existing foundation.

- The core platform MUST define a stable plugin/game registration
  interface that new games implement.
- Adding a new game MUST NOT require modifications to the core
  application shell, routing infrastructure, or other existing games.
- Each game MUST be a self-contained module that declares its own
  assets, state management, and UI while conforming to platform
  contracts.
- The platform MUST support versioned game manifests so games can
  declare compatibility and dependencies explicitly.

**Rationale**: The long-term value of Dynamo depends on a growing
library of games. An architecture that requires restructuring for
every new addition is unsustainable and contradicts the platform's
mission.

### III. Multiplayer-First Design

Multiplayer and shared social interaction MUST be treated as a
first-class design principle, supporting both online room-based
experiences and games intended for shared-screen group play.

- The platform MUST provide a room/lobby system that allows players
  to create, join, and manage shared game sessions.
- Game interfaces MUST support both networked multiplayer (players on
  separate devices) and local shared-screen multiplayer (multiple
  players on one display).
- Real-time synchronization primitives (state sync, event broadcast,
  turn management) MUST be provided as core platform services that
  games consume rather than re-implement.
- Social features (player names, avatars, reactions) MUST be
  available as shared platform components, not per-game
  implementations.

**Rationale**: Dynamo's primary context is group gatherings — youth
nights, retreats, and fellowship events. Multiplayer is not a
secondary feature; it is the reason the platform exists.

### IV. Reusable & Composable Architecture

Development MUST favor reusable, composable components and consistent
patterns over duplicated or game-specific implementations.

- Common UI elements (buttons, modals, timers, scoreboards, player
  lists) MUST be implemented as shared components in a platform-level
  component library.
- Shared game mechanics (turn systems, scoring, countdown timers,
  voting) MUST be provided as composable utilities or hooks that
  games can adopt.
- Consistent API patterns MUST be maintained across all services
  (naming conventions, error handling, data shapes).
- Code duplication across games or platform modules MUST be
  identified during review and refactored into shared abstractions.

**Rationale**: Duplication leads to inconsistency, increased
maintenance burden, and divergent behavior across games. A composable
architecture accelerates the addition of new games while preserving
quality.

### V. Content–Logic Separation

Dynamic game content MUST be separated from core application logic so
content can evolve independently over time.

- Game questions, prompts, themes, media assets, and configurable
  parameters MUST be stored as structured data files (JSON, YAML, or
  equivalent), not embedded in application code.
- The platform MUST support loading, validating, and hot-swapping
  content packs without requiring application redeployment.
- Content schemas MUST be versioned and validated at load time to
  prevent runtime errors from malformed data.
- Content authoring MUST be possible by non-developers (youth
  leaders, content contributors) given appropriate tooling.

**Rationale**: Game content has a fundamentally different lifecycle
than application logic. Decoupling them allows the game library to
grow and refresh without engineering bottlenecks.

### VI. Simplicity & Fast Onboarding

The user experience MUST prioritize simplicity, clarity,
accessibility, and fast onboarding, particularly in group and
youth-gathering contexts.

- A new player MUST be able to join an active game session in under
  30 seconds with no account creation, download, or tutorial
  required.
- All primary interactions MUST be achievable with minimal text input
  — favor tapping, selecting, and swiping over typing.
- The interface MUST be usable on phones, tablets, and projected
  displays without layout breakage.
- Accessibility standards (sufficient contrast, readable font sizes,
  screen-reader compatibility for critical flows) MUST be met.
- Error states and loading states MUST be clearly communicated with
  friendly, non-technical language.

**Rationale**: Dynamo is used in fast-paced group settings where
attention spans are short and technical support is unavailable.
Friction at any point — joining, playing, or recovering from errors
— undermines the entire experience.

### VII. Neobrutalist Visual Identity

The visual identity MUST consistently follow a neobrutalist design
direction with a subtle comic-inspired character, while maintaining
usability and readability.

- The design system MUST define and enforce a neobrutalist token set:
  bold outlines, flat vibrant fills, strong shadows, and chunky
  typography.
- Comic-inspired elements (speech bubbles, halftone patterns, action
  lines, expressive type treatments) MUST be used as accent and
  personality elements, not as the dominant structural pattern.
- Readability MUST NOT be sacrificed for stylistic choices —
  text contrast ratios MUST meet WCAG AA at minimum.
- All games MUST use the shared design system tokens and components
  to maintain visual coherence across the platform.
- The design system MUST be documented with usage examples so new
  game contributors can apply the identity correctly.

**Rationale**: A strong, distinctive visual identity makes Dynamo
instantly recognizable and sets it apart from generic game platforms.
The neobrutalist + comic direction conveys energy and playfulness
that resonates with a youth audience while remaining bold and modern.

### VIII. Maintainability & Pragmatic Engineering

The project MUST favor maintainability, modularity, and pragmatic
engineering decisions that support the platform's long-term growth.

- Architectural decisions MUST be documented with rationale
  (Architecture Decision Records or equivalent).
- Dependencies MUST be evaluated for maintenance health, bundle size
  impact, and licensing compatibility before adoption.
- Abstractions MUST be introduced only when they serve two or more
  concrete use cases — speculative generalization MUST be avoided.
- Code MUST be organized into clearly bounded modules with explicit
  public interfaces and minimal cross-module coupling.
- Technical debt MUST be tracked, prioritized, and addressed
  incrementally — not deferred indefinitely.

**Rationale**: Dynamo is a long-lived platform that will be extended
by multiple contributors over time. Pragmatic engineering discipline
ensures that today's decisions do not become tomorrow's blockers.

## Design & Content Standards

- **Content Safety Reviews**: Any new game or content pack MUST
  undergo a content review against Principle I before integration.
  This review verifies appropriateness of themes, language, imagery,
  and interaction patterns for youth audiences.
- **Design System Compliance**: All UI contributions MUST use the
  shared design system. Custom styling that deviates from the
  neobrutalist token set MUST be justified and approved before merge.
- **Responsive & Accessible**: Every screen MUST be tested on mobile
  portrait, tablet landscape, and projected/large-screen layouts.
  Accessibility checks (contrast, focus order, aria labels) MUST be
  part of the definition of done.
- **Content Portability**: Game content packs MUST be self-describing
  (include metadata, schema version, and attribution) and loadable
  independently of specific game code versions.

## Development Standards

- **Modular Boundaries**: Each game, platform service, and shared
  library MUST define an explicit public API surface. Internal
  implementation details MUST NOT be imported across module
  boundaries.
- **Consistent Patterns**: Platform-level patterns for state
  management, event handling, error propagation, and data fetching
  MUST be established early and followed by all modules.
- **Incremental Delivery**: Features MUST be deliverable in vertical
  slices (one complete user story at a time) rather than horizontal
  layers.
- **Documentation**: Public APIs, game registration contracts, and
  content schemas MUST be documented alongside their implementation.
  Documentation MUST be updated when the corresponding code changes.

## Governance

- This constitution supersedes all other architectural and design
  guidelines. In any conflict, this document is authoritative.
- Amendments require:
  1. A written proposal describing the change, its rationale, and
     its impact on existing principles.
  2. Review and approval by the project lead(s).
  3. A migration plan for any existing code, content, or processes
     affected by the change.
  4. An updated constitution version following semantic versioning.
- Versioning policy:
  - **MAJOR**: Removal, redefinition, or backward-incompatible change
    to any principle.
  - **MINOR**: Addition of a new principle or material expansion of
    existing guidance.
  - **PATCH**: Clarifications, wording improvements, or non-semantic
    refinements.
- All pull requests and code reviews MUST verify compliance with the
  applicable principles. Reviewers MUST cite the specific principle
  when requesting changes for constitutional reasons.
- A quarterly compliance review SHOULD be conducted to assess
  adherence and identify areas where the constitution may need
  amendment.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
