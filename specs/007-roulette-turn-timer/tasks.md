# Tasks: Roulette Turn Timer, Spin Result Polish, and Hint Cost Adjustment

**Input**: Design documents from `specs/007-roulette-turn-timer/` ([plan.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/plan.md), [spec.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/spec.md), [research.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/research.md), [data-model.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/data-model.md), [contracts/roulette-timer-contract.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/contracts/roulette-timer-contract.md), [quickstart.md](file:///c:/projects/dinamo/dynamo/specs/007-roulette-turn-timer/quickstart.md))

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/roulette-timer-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story identifier ([US1], [US2], [US3], [US4]) for user story phase tasks
- Clear file paths specified for every task

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Validate baseline session timer configuration and setup localization keys.

- [X] T001 [P] Verify existing session timeLimitSeconds configuration in backend/src/Dynamo.Core/Entities/Session.cs and frontend/src/app/core/models/session.model.ts
- [X] T002 [P] Add timer urgency and hint localization keys to frontend/public/i18n/es.json and frontend/public/i18n/en.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state model extensions and timer synchronization primitives that MUST be completed before any user story can be implemented.

**⚠️ CRITICAL**: No user story implementation can begin until these foundational state contracts are established.

- [X] T003 [P] Add TurnDeadlineUtc, IsTurnTimerPaused, and IsFirstSpinOfTurn state properties to backend/src/Dynamo.Core/Models/BiblicalRouletteState.cs
- [X] T004 [P] Add turnDeadlineUtc, isTurnTimerPaused, and isFirstSpinOfTurn properties to BiblicalRouletteState in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts
- [X] T005 Setup authoritative timer cancellation token sources and lifecycle management in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Active Turn Countdown with First-Spin Grace Period (Priority: P1) 🎯 MVP

**Goal**: Provide an authoritative turn countdown driven by `session.timeLimitSeconds` (default: 60s) with a +15-second grace bonus on the first spin opportunity of a turn (e.g. 75s). On timeout, authoritatively forfeit the turn and advance to the next player. Render a top-right countdown badge adjacent to the turn score with color-coded urgency states (yellow $\le$10s, pulsing red $\le$5s).

**Independent Test**: Configure a match with `timeLimitSeconds = 30`. Verify active player initializes with 45s (30s + 15s) in top right header. Allow timer to reach 0 without acting; verify turn forfeits and next player receives active turn with fresh 45s countdown.

### Tests for User Story 1

- [X] T006 [P] [US1] Add unit tests for initial turn duration (+15s bonus) and timeout turn forfeiture in backend/tests/Dynamo.Application.Tests/BiblicalRouletteActorTests.cs

### Implementation for User Story 1

- [X] T007 [US1] Implement turn timeout monitoring loop and automatic AdvanceToNextTurn in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs (depends on T003, T005, T006)
- [X] T008 [US1] Calculate and broadcast turnDeadlineUtc with first-spin grace period (+15s) in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs (depends on T007)
- [X] T009 [US1] Implement reactive client countdown signal and interval calculation in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts (depends on T004)
- [X] T010 [US1] Render top-right countdown timer badge with urgency color coding (yellow <=10s, pulsing red <=5s) adjacent to turn score in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts (depends on T009)

**Checkpoint**: At this point, User Story 1 delivers a fully functional, synchronized MVP turn timer with automatic advancement.

---

## Phase 4: User Story 2 - Action-Based Timer Resets and Event-Based Pausing (Priority: P1)

**Goal**: Reset the turn timer back to the standard configured duration (without the +15s bonus) upon valid actions (`SPIN_ROULETTE`, `PURCHASE_VOWEL`, `PURCHASE_HINT`). Pause countdown during wheel spinning animation, while the Solve Verse modal is open, and while the Spin Result modal is visible.

**Independent Test**: In an active turn, spin the roulette wheel and confirm the countdown stops during rotation. When Spin Result modal opens, confirm timer remains paused. Close modal and buy a vowel or hint, verifying the timer resets to the standard duration (e.g. 60s instead of 75s). Open the Solve modal and confirm the timer does not decrease.

### Tests for User Story 2

- [X] T011 [P] [US2] Add unit tests for action-based timer resets and pause state transitions in backend/tests/Dynamo.Application.Tests/BiblicalRouletteActorTests.cs

### Implementation for User Story 2

- [X] T012 [US2] Implement timer reset logic removing first-spin bonus on SPIN_ROULETTE, PURCHASE_VOWEL, and PURCHASE_HINT in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs (depends on T011)
- [X] T013 [US2] Implement server-side timer pause/resume handling for SOLVE_PHRASE modal and spin lifecycle in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs (depends on T012)
- [X] T014 [US2] Synchronize client timer pause state when solve modal opens/closes, wheel spins, or spin result modal displays in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts (depends on T010, T013)

**Checkpoint**: User Stories 1 and 2 work seamlessly together, providing accurate pacing without penalizing user modal focus or animations.

---

## Phase 5: User Story 3 - Streamlined & Impactful Spin Result Modal (Priority: P2)

**Goal**: Redesign the Spin Result modal to automatically dismiss after 3 seconds, offer a wider neobrutalist presentation with larger wedge values and letters found, display spin total amount simply as inline text (e.g. `+100` or `+300 pts`) without a nested sub-component card, and retain early manual dismissal via "Continuar".

**Independent Test**: Complete a roulette spin landing on a point wedge. Confirm the result modal is wider, displays the earned score as plain inline text, can be dismissed immediately via "Continuar", or auto-dismisses after exactly 3.0 seconds when untouched.

### Implementation for User Story 3

- [X] T015 [US3] Implement 3-second auto-dismiss timer with manual early dismiss cleanup in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts
- [X] T016 [US3] Widen Spin Result modal container and enlarge typography for result label and letters found in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts
- [X] T017 [US3] Replace nested sub-component card for spin points with clean inline text (+points) in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts

**Checkpoint**: Spin outcomes are visually punchy and flow effortlessly without requiring repetitive dismiss clicks.

---

## Phase 6: User Story 4 - Calibrated Specific Hint Cost (5,000 Points) (Priority: P3)

**Goal**: Adjust the cost of purchasing the specific verse hint from 10,000 points to 5,000 points across backend validation, frontend button thresholds, confirmation dialogs, phrase board locked badges, and game logs.

**Independent Test**: Give a player 4,999 points and verify the Hint button remains disabled. Give a player 5,000 points, open confirmation modal, verify it indicates 5,000 points, confirm purchase, and verify exactly 5,000 points are deducted and the hint is revealed.

### Tests for User Story 4

- [X] T018 [P] [US4] Add unit tests for 5,000-point hint cost requirement and score deduction in backend/tests/Dynamo.Application.Tests/BiblicalRouletteActorTests.cs

### Implementation for User Story 4

- [X] T019 [US4] Update hint deduction threshold and deduction amount to 5,000 points in backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs (depends on T018)
- [X] T020 [P] [US4] Update hint purchase affordability check, confirmation modal text, and button threshold to 5,000 points in frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts
- [X] T021 [P] [US4] Update locked badge cost indicator to '(5,000 pts)' in frontend/src/app/features/games/biblical-roulette/phrase-board/phrase-board.component.ts

**Checkpoint**: All 4 user stories are fully implemented and calibrated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: System integration verification, test suite execution, and end-to-end validation.

- [X] T022 Run backend test suite with dotnet test in backend/tests/Dynamo.Application.Tests/BiblicalRouletteActorTests.cs
- [X] T023 Validate frontend production build with npm run build in frontend/
- [X] T024 Execute end-to-end quickstart validation scenarios from specs/007-roulette-turn-timer/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1: Setup (T001, T002)
   │
   ▼
Phase 2: Foundational (T003, T004, T005)
   │
   ├──────────────────────────────┬──────────────────────────────┐
   ▼                              ▼                              ▼
Phase 3: US1 Turn Countdown (P1) Phase 5: US3 Spin Modal (P2) Phase 6: US4 Hint Cost (P3)
(T006 -> T007 -> T008 -> T009 -> T010) (T015 -> T016 -> T017)  (T018 -> T019, T020, T021)
   │
   ▼
Phase 4: US2 Action Resets & Pausing (P1)
(T011 -> T012 -> T013 -> T014)
   │
   └──────────────────────────────┬──────────────────────────────┘
                                  │
                                  ▼
                     Phase 7: Polish & Verification (T022, T023, T024)
```

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately after Phase 2 (Foundational). Has no dependencies on US2, US3, or US4.
- **User Story 2 (P1)**: Extends US1 countdown timer with pause states and action resets. Depends on US1 completion.
- **User Story 3 (P2)**: Independent UI/UX polish of Spin Result modal. Can start immediately after Phase 2.
- **User Story 4 (P3)**: Hint pricing calibration across backend and frontend. Can start immediately after Phase 2.

---

## Parallel Execution Opportunities

### Phase 1 & 2 Parallel Tasks
- `T001` (Backend/Frontend config check) and `T002` (Localization updates) can run in parallel.
- `T003` (C# state model) and `T004` (TS state interface) can run in parallel.

### User Story 1 Parallel Tasks
- `T006` (Backend unit tests) can run in parallel with frontend model alignment.

### User Story 4 Parallel Tasks
- `T018` (Backend unit tests) can run in parallel with `T020` and `T021` (Frontend templates & badges).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`, `T002`).
2. Complete Phase 2: Foundational (`T003`, `T004`, `T005`).
3. Complete Phase 3: User Story 1 (`T006` – `T010`).
4. **STOP and VALIDATE**: Verify synchronized countdown, +15s bonus, and turn transition on timeout.

### Incremental Delivery

1. **Increment 1 (MVP)**: Turn countdown timer + first spin bonus + turn timeout forfeiture (US1).
2. **Increment 2**: Action resets (spin, vowel, hint) and pausing (solve modal, wheel spin, result modal) (US2).
3. **Increment 3**: Redesigned 3s auto-dismiss wide Spin Result modal with direct text points (US3).
4. **Increment 4**: 5,000-point hint cost calibration across the entire stack (US4).
5. **Increment 5**: Run automated test suite and quickstart manual verification scenarios.
