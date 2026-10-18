# Implementation Plan: Card Question & Answer Game

**Branch**: `005-card-qa-game` | **Date**: 2026-10-18 | **Spec**: [spec.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/spec.md)

**Input**: Feature specification from `specs/005-card-qa-game/spec.md` with explicit constraints: "No new tech needs to be implemented, just use tailwind for the animation if possible, if not always allowed to use custom css, also try to use reusable components always".

---

## Summary

Build a dedicated, shared-screen **Card Question & Answer Game** (`card-qa`) integrated into the Dynamo game catalog. The game presents a 5x4 grid of 20 numbered face-down cards. When a card is selected, it expands with a blurred background backdrop (`backdrop-blur-md`) and flips via hardware-accelerated 3D CSS transforms to reveal the question. A second click flips the card to reveal the answer. Directly under the revealed answer, the host marks the player's response as "Correct" or "Incorrect", closes the modal, and the card becomes disabled on the grid.

The game tracks named player rounds with a configurable question quota (default 5 questions). Detailed scores are kept hidden during play and viewed on-demand via a Results Modal (where hosts can also toggle evaluations to fix misclicks, or manually reset the board). Questions can be sourced from a backend endpoint (`/api/games/card-qa/questions`) with offline fallback, or custom-authored in the browser's `localStorage` with JSON export/import support. The implementation relies strictly on existing dependencies (Angular 18 Signals, Tailwind CSS 3.4, and ASP.NET Core / EF Core), reusing existing platform components (`app-modal`, `app-button`, `TranslatePipe`).

---

## Technical Context

**Language/Version**: C# 12 (.NET 8) / TypeScript ~5.5.2, Angular ^18.2.0  
**Primary Dependencies**: Zero new libraries (built-in `@angular/core`, `@angular/common`, `@angular/forms`, `rxjs`, Tailwind CSS 3.4, ASP.NET Core EF Core)  
**Storage**: Client-side `window.localStorage` (key: `dynamo_card_qa_custom_questions`), SQLite/PostgreSQL (Backend `CardQuestions` table via EF Core)  
**Testing**: Scenario-based validation per [quickstart.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/quickstart.md), xUnit backend tests, Angular compilation checks (`npm run build`)  
**Target Platform**: Evergreen desktop, tablet, and projector web browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Shared-Screen Web Game (Single-display host presentation + ASP.NET Core API)  
**Performance Goals**:
- Card flip and expansion animations complete smoothly at 60fps in under 400ms (SC-002)
- Zero-latency reactive score recalculation upon evaluation toggling (<16ms)
- Question pack JSON export and import execution <100ms  
**Constraints**:
- Strictly shared-screen only (no mobile client connections or WebSocket synchronization needed)
- No new libraries or animation frameworks; pure Tailwind CSS + scoped CSS 3D transforms (`preserve-3d`, `backface-visibility: hidden`)
- Maximum reuse of existing components (`app-modal`, `app-button`, `TranslatePipe`)
- No automatic winner modal; host views scores in Results Modal and manually resets the board
- 100% internationalized in Spanish (default) and English  
**Scale/Scope**:
- Board grid: 12 to 24 cards (default 20, 5x4)
- Questions per player turn: 1 to 10 (default 5)
- 3 question types: True/False, Option Selection (Multiple Choice), Open Question
- 2 question sources: Database (API with offline seed fallback) and Custom (`localStorage` + JSON file)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Evaluation | Status |
|:---|:---|:---:|
| **I. Wholesome & Safe Environment** | All default and seeded questions are Biblical, youth-appropriate, respectful, and safe for church gatherings. | **PASS** |
| **II. Extensible Games Platform** | Implemented as a self-contained game module under `frontend/src/app/features/games/card-qa/` conforming to the platform game catalog and shared-screen interfaces without modifying core shell or other games. | **PASS** |
| **III. Multiplayer-First Design** | Designed specifically for shared-screen group interaction on a projector/TV, where a host facilitates play and youth participate verbally. | **PASS** |
| **IV. Reusable & Composable Architecture** | Reuses existing shared components (`ModalComponent`, `ButtonComponent`) and core i18n pipe (`TranslatePipe`). Components are modular and reusable. | **PASS** |
| **V. Content–Logic Separation** | Questions are stored as structured data (EF Core database or JSON files / local storage), completely decoupled from card animation and game logic. | **PASS** |
| **VI. Simplicity & Fast Onboarding** | Zero setup required to start; host simply enters player name and clicks numbered cards. No accounts or downloads. | **PASS** |
| **VII. Neobrutalist Visual Identity** | Adopts Dynamo neobrutalist tokens (bold 3px/4px black borders, flat vibrant fills, comic typography, crisp shadows). | **PASS** |
| **VIII. Maintainability & Pragmatic Engineering** | Zero new external dependencies, clean Angular Signals architecture, pure CSS transforms for animations. | **PASS** |

*Gate Result*: **ALL GATES PASS**.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-card-qa-game/
├── spec.md              # Feature specification & clarifications
├── plan.md              # This implementation plan
├── research.md          # Technical research & animation/reusability decisions
├── data-model.md        # Entities, types, and schema specifications
├── quickstart.md        # Step-by-step verification guide & test scenarios
├── contracts/
│   ├── card-questions.api.md        # REST API contract for GET /api/games/card-qa/questions
│   └── card-qa-service.contract.ts  # TypeScript contract for CardQaService
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code Changes

```text
backend/
├── src/
│   ├── Dynamo.Core/
│   │   ├── Entities/
│   │   │   └── CardQuestion.cs                 # Entity: Id, Text, Type, OptionsJson, Answer, Language
│   │   └── Enums/
│   │       └── CardQuestionType.cs             # TrueFalse, OptionSelection, OpenQuestion
│   ├── Dynamo.Application/
│   │   └── Games/
│   │       └── CardQa/
│   │           ├── Queries/
│   │           │   ├── GetCardQuestionsQuery.cs
│   │           │   └── CardQuestionDto.cs
│   │           └── Handlers/
│   │               └── GetCardQuestionsQueryHandler.cs
│   ├── Dynamo.Infrastructure/
│   │   ├── Persistence/
│   │   │   ├── Configurations/
│   │   │   │   └── CardQuestionConfiguration.cs
│   │   │   └── Seeding/
│   │   │       └── CardQuestionSeeder.cs       # Pre-seeded Spanish and English trivia
│   │   └── Migrations/
│   └── Dynamo.Api/
│       └── Controllers/
│           └── CardQuestionsController.cs      # GET /api/games/card-qa/questions
└── tests/
    └── Dynamo.Application.Tests/
        └── CardQaTests.cs

frontend/
├── public/
│   └── i18n/
│       ├── es.json                             # Add Card Q&A Spanish localization strings
│       └── en.json                             # Add Card Q&A English localization strings
└── src/
    └── app/
        ├── core/
        │   └── models/
        │       └── game.model.ts               # Ensure 'SharedScreen' catalog support
        └── features/
            ├── hub/
            │   └── hub.component.ts            # Register Card Q&A game card in catalog
            ├── sessions/
            │   └── active-match/
            │       └── active-match.component.ts # Mount CardQaComponent for 'card-qa' slug
            └── games/
                ├── index.ts                    # Barrel export
                └── card-qa/
                    ├── index.ts                # Barrel export
                    ├── models/
                    │   └── card-qa.models.ts   # BoardCard, CardQuestion, PlayerRound, QuestionResult
                    ├── services/
                    │   ├── card-qa.service.ts  # Signals state, API fetch, offline fallback, localStorage
                    │   └── card-qa-seeds.ts    # Bundled offline fallback question bank
                    ├── components/
                    │   ├── card-grid/          # 5x4 grid of numbered cards
                    │   │   └── card-grid.component.ts
                    │   ├── card-item/          # Individual numbered card tile with flip styling
                    │   │   └── card-item.component.ts
                    │   ├── card-modal/         # Expanding modal with 3D flip animation & host evaluation
                    │   │   ├── card-modal.component.ts
                    │   │   └── card-modal.component.scss
                    │   ├── results-modal/      # Scoreboard modal with misclick correction & reset
                    │   │   └── results-modal.component.ts
                    │   ├── config-modal/       # Card count & questions-per-turn configuration
                    │   │   └── config-modal.component.ts
                    │   └── custom-questions-modal/ # LocalStorage editor with JSON Export / Import
                    │       └── custom-questions-modal.component.ts
                    └── card-qa.component.ts    # Root game view orchestrating grid and modals
```

---

## Complexity Tracking

*No violations or unnecessary abstractions introduced.*
- Strict adherence to zero-dependency rule.
- Direct reuse of `ModalComponent` and `ButtonComponent`.
- Pure Tailwind and CSS 3D transforms for card flips.
- Offline fallback ensures maximum reliability for live youth events.
