# Tasks: Card Question & Answer Game

**Input**: Design documents from `specs/005-card-qa-game/`  
**Prerequisites**: [plan.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/plan.md), [spec.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/spec.md), [research.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/research.md), [data-model.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/data-model.md), [contracts/](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/contracts/), [quickstart.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/quickstart.md)  
**Tests**: Backend query tests included; frontend validated via quickstart scenarios and build checks.  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  
**Constraints**: Zero new libraries/dependencies installed; use Tailwind CSS with scoped CSS 3D transforms for card flip animations; maximize reuse of existing components (`app-modal`, `app-button`, `TranslatePipe`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create project directory structure, base localization strings, and domain models.

- [ ] T001 Create directory structure for Card Q&A game module in `frontend/src/app/features/games/card-qa/` with subdirectories `components/`, `models/`, and `services/`
- [ ] T002 [P] Define TypeScript domain models, enums, and interfaces (`CardQuestion`, `BoardCard`, `QuestionResult`, `PlayerRound`, `PlayerSummary`, `GameConfiguration`) in `frontend/src/app/features/games/card-qa/models/card-qa.models.ts`
- [ ] T003 [P] Create bundled offline seed questions bank for Spanish and English in `frontend/src/app/features/games/card-qa/services/card-qa-seeds.ts`
- [ ] T004 [P] Add Spanish and English Card Q&A localization keys in `frontend/public/i18n/es.json` and `frontend/public/i18n/en.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state service and platform routing/catalog integration that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 Implement `CardQaService` managing reactive Signals (`cards`, `activeCard`, `activeRound`, `allResults`, `playerSummaries`, `config`), board initialization, card selection, and question loading in `frontend/src/app/features/games/card-qa/services/card-qa.service.ts`
- [ ] T006 [P] Register Card Q&A game in game catalog models and Hub catalog view in `frontend/src/app/core/models/game.model.ts` and `frontend/src/app/features/hub/hub.component.ts`
- [ ] T007 [P] Create public module barrel export in `frontend/src/app/features/games/card-qa/index.ts` and update `frontend/src/app/features/games/index.ts`
- [ ] T008 Mount Card Q&A game container for shared-screen sessions in `frontend/src/app/features/sessions/active-match/active-match.component.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Numbered Card Grid & 3D Flip Card Q&A Interaction (Priority: P1) 🎯 MVP

**Goal**: Deliver the primary 5x4 grid of 20 numbered face-down cards, modal expansion with blurred backdrop, 3D flip animation for question, flip animation for answer, host evaluation controls, and card disabling.

**Independent Test**: Load the Card Q&A game, click Card #1, verify modal expansion with background blur, click to flip from question to answer with 3D animation, click "Correct", verify modal closes, and confirm Card #1 appears disabled on the grid.

- [ ] T009 [P] [US1] Implement individual numbered card tile component `CardItemComponent` with neobrutalist styling, numbered face, and disabled state in `frontend/src/app/features/games/card-qa/components/card-item/card-item.component.ts`
- [ ] T010 [P] [US1] Implement 5x4 responsive grid container `CardGridComponent` displaying numbered cards in `frontend/src/app/features/games/card-qa/components/card-grid/card-grid.component.ts`
- [ ] T011 [US1] Implement expanding `CardModalComponent` with backdrop blur (`backdrop-blur-md`), scoped CSS 3D flip animations (`preserve-3d`, `rotate-y-180`, `backface-visibility: hidden`), and reusable `app-button` controls for "Correct" and "Incorrect" in `frontend/src/app/features/games/card-qa/components/card-modal/card-modal.component.ts` and `frontend/src/app/features/games/card-qa/components/card-modal/card-modal.component.scss`
- [ ] T012 [US1] Assemble root `CardQaComponent` connecting the grid, active card expansion, host evaluation, card disabling, and backdrop in `frontend/src/app/features/games/card-qa/card-qa.component.ts`

**Checkpoint**: User Story 1 is functional as an MVP — cards flip smoothly in 3D, reveal question then answer, host can mark correct/incorrect, and cards disable upon closing.

---

## Phase 4: User Story 2 - Player Turn Management & Question Quota (Priority: P1)

**Goal**: Organize gameplay into distinct, named player rounds where each player answers a configurable number of questions (default 5 questions) before passing the turn to the next player.

**Independent Test**: Enter player name "David", answer 5 cards, verify each question is attributed to David, confirm turn counter advances ("Question 1 of 5" to "Question 5 of 5"), and verify a prompt appears to start the next player's round ("Sarah").

- [ ] T013 [US2] Implement player registration prompt dialog requiring a non-empty player name before enabling the board in `frontend/src/app/features/games/card-qa/card-qa.component.ts`
- [ ] T014 [US2] Implement turn progress indicator ("Question X of N") and quota completion detection in `frontend/src/app/features/games/card-qa/card-qa.component.ts`
- [ ] T015 [US2] Implement round completion notification prompting the host to register the next player while preserving remaining active cards on the board in `frontend/src/app/features/games/card-qa/card-qa.component.ts`

**Checkpoint**: User Stories 1 AND 2 are fully functional — structured rounds with named players and question quotas.

---

## Phase 5: User Story 3 - Hidden Results List & Scoreboard Modal (Priority: P2)

**Goal**: Provide an on-demand Results Modal displaying player scores and itemized question histories, allowing the host to toggle evaluations to fix misclicks and manually reset the board without a forced winner modal.

**Independent Test**: Click "View Results" during or after play, verify all players and evaluated questions are displayed, click an evaluated item to toggle between Correct and Incorrect (confirming instant score recalculation), and test the manual "Reset Board" button.

- [ ] T016 [US3] Implement `ResultsModalComponent` reusing `app-modal` and `app-button` to display player score summaries, correct/incorrect totals, and itemized question histories in `frontend/src/app/features/games/card-qa/components/results-modal/results-modal.component.ts`
- [ ] T017 [US3] Implement interactive evaluation toggling in `ResultsModalComponent` to allow host misclick corrections, updating `CardQaService` reactively in `frontend/src/app/features/games/card-qa/components/results-modal/results-modal.component.ts`
- [ ] T018 [US3] Implement manual board reset button in `ResultsModalComponent` with confirmation dialog to restart the game without a forced winner modal in `frontend/src/app/features/games/card-qa/components/results-modal/results-modal.component.ts`
- [ ] T019 [US3] Integrate "View Results" trigger button into the top toolbar of `frontend/src/app/features/games/card-qa/card-qa.component.ts`

**Checkpoint**: User Stories 1, 2, AND 3 work together — full score tracking with misclick corrections and host-driven resets.

---

## Phase 6: User Story 4 - Game Configuration & Custom Questions in Local Storage (Priority: P2)

**Goal**: Enable game admins to configure card counts and question quotas, author custom True/False, Option Selection, and Open questions stored in `localStorage`, and export/import JSON question packs.

**Independent Test**: Open Configuration, set card count to 16, create a custom Option Selection question in the Custom Questions Manager, export to JSON, import the JSON file, and start a match to verify the custom question appears on a card.

- [ ] T020 [P] [US4] Implement `ConfigModalComponent` reusing `app-modal` to configure total card count (12, 16, 20, 24) and questions per player turn (3, 5, 10) in `frontend/src/app/features/games/card-qa/components/config-modal/config-modal.component.ts`
- [ ] T021 [US4] Implement `CustomQuestionsModalComponent` reusing `app-modal` for creating, viewing, editing, and deleting True/False, Option Selection, and Open questions in `frontend/src/app/features/games/card-qa/components/custom-questions-modal/custom-questions-modal.component.ts`
- [ ] T022 [US4] Implement JSON question pack export and import utilities with schema validation in `frontend/src/app/features/games/card-qa/components/custom-questions-modal/custom-questions-modal.component.ts`
- [ ] T023 [US4] Connect custom questions selection to `CardQaService` to draw questions from `localStorage` in `frontend/src/app/features/games/card-qa/services/card-qa.service.ts`

**Checkpoint**: User Stories 1 through 4 are fully functional — flexible settings and custom question management with file portability.

---

## Phase 7: User Story 5 - Database-Sourced Questions Integration (Priority: P3)

**Goal**: Deliver backend API support (`GET /api/games/card-qa/questions`) querying pre-seeded Biblical trivia from the database filtered by language, with automatic offline fallback to bundled seeds.

**Independent Test**: Call `GET /api/games/card-qa/questions?language=es` and verify seeded Spanish questions return. Disconnect or stop backend and verify frontend seamlessly falls back to bundled seed array without error.

- [ ] T024 [P] [US5] Create `CardQuestion` entity and `CardQuestionType` enum in `backend/src/Dynamo.Core/Entities/CardQuestion.cs` and `backend/src/Dynamo.Core/Enums/CardQuestionType.cs`
- [ ] T025 [P] [US5] Add `DbSet<CardQuestion>` and EF Core entity configuration in `backend/src/Dynamo.Infrastructure/Persistence/AppDbContext.cs` and `backend/src/Dynamo.Infrastructure/Persistence/Configurations/CardQuestionConfiguration.cs`
- [ ] T026 [US5] Create database migration and Biblical question seeder in Spanish and English in `backend/src/Dynamo.Infrastructure/Persistence/Seeding/CardQuestionSeeder.cs`
- [ ] T027 [P] [US5] Implement `GetCardQuestionsQuery`, DTO, and handler in `backend/src/Dynamo.Application/Games/CardQa/Queries/GetCardQuestionsQuery.cs`
- [ ] T028 [US5] Implement `CardQuestionsController` exposing `GET /api/games/card-qa/questions` in `backend/src/Dynamo.Api/Controllers/CardQuestionsController.cs`
- [ ] T029 [US5] Add unit tests for `GetCardQuestionsQueryHandler` in `backend/tests/Dynamo.Application.Tests/CardQaTests.cs`
- [ ] T030 [US5] Connect `CardQaService` to fetch questions from `GET /api/games/card-qa/questions` with automatic fallback to bundled seeds in `frontend/src/app/features/games/card-qa/services/card-qa.service.ts`

**Checkpoint**: All 5 user stories are complete and integrated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Visual identity audit, complete translation verification, viewport responsiveness, and end-to-end verification.

- [ ] T031 [P] Audit all Card Q&A UI elements against Dynamo Neobrutalist design tokens (3px/4px black borders, stark drop shadows, flat vibrant fills, chunky typography) across `frontend/src/app/features/games/card-qa/`
- [ ] T032 [P] Verify 100% i18n translation coverage with zero raw keys visible in `frontend/public/i18n/es.json` and `frontend/public/i18n/en.json`
- [ ] T033 Verify responsive grid layout across desktop, tablet, and projected display viewports
- [ ] T034 Execute end-to-end verification walkthrough adhering to `specs/005-card-qa-game/quickstart.md`
- [ ] T035 Verify clean frontend build (`npm run build`) and backend tests (`dotnet test`) pass with zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion — delivers MVP card grid & flip.
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion — adds player turns and quota.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4 completion — adds results modal and correction.
- **User Story 4 (Phase 6)**: Depends on Phase 2 completion — can be developed in parallel with US1-US3.
- **User Story 5 (Phase 7)**: Backend tasks (T024-T029) can proceed in parallel with frontend stories; frontend integration (T030) depends on Phase 2.
- **Polish (Phase 8)**: Depends on all user stories being complete.

---

## Parallel Opportunities

```bash
# Phase 1 parallel tasks:
T002 [P] Define TypeScript domain models in frontend/src/app/features/games/card-qa/models/card-qa.models.ts
T003 [P] Create bundled offline seed questions bank in frontend/src/app/features/games/card-qa/services/card-qa-seeds.ts
T004 [P] Add localization keys in frontend/public/i18n/es.json and en.json

# Phase 2 parallel tasks:
T006 [P] Register game in models and Hub catalog in frontend/src/app/core/models/game.model.ts and hub.component.ts
T007 [P] Create barrel export in frontend/src/app/features/games/card-qa/index.ts

# Phase 3 parallel tasks:
T009 [P] [US1] Implement CardItemComponent in frontend/src/app/features/games/card-qa/components/card-item/card-item.component.ts
T010 [P] [US1] Implement CardGridComponent in frontend/src/app/features/games/card-qa/components/card-grid/card-grid.component.ts

# Phase 7 backend parallel tasks:
T024 [P] [US5] Create CardQuestion entity in backend/src/Dynamo.Core/Entities/CardQuestion.cs
T025 [P] [US5] Add DbSet and configuration in backend/src/Dynamo.Infrastructure/Persistence/
T027 [P] [US5] Implement GetCardQuestionsQuery in backend/src/Dynamo.Application/Games/CardQa/Queries/
```

---

## Implementation Strategy

### MVP First (Phases 1, 2, and 3)
1. Complete Setup (Phase 1) and Foundation (Phase 2).
2. Implement User Story 1 (Phase 3): 5x4 grid, 3D flip card, and host evaluation.
3. **STOP and VALIDATE**: Verify that cards flip smoothly, reveal question then answer, and disable upon closing.
4. Add User Story 2 (player turns) and User Story 3 (results modal with misclick correction).
5. Add User Story 4 (custom questions in localStorage) and User Story 5 (backend database questions).
6. Execute full polish and build verification.
