# Tasks: Biblical Roulette

**Input**: Design documents from `/specs/003-biblical-roulette/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested; only core functional implementation tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 [P] Create frontend feature directory structure in `frontend/src/app/features/sessions/active-match/biblical-roulette/`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Create `Phrase` database entity in `backend/src/Dynamo.Core/Entities/Phrase.cs`
- [X] T003 Setup database migrations for `Phrase` entity
- [X] T004 [P] Create `BiblicalRouletteState` model in `backend/src/Dynamo.Core/Models/BiblicalRouletteState.cs`
- [X] T005 [P] Update `MultiplayerMode` enum to include `BiblicalRoulette` in `backend/src/Dynamo.Core/Enums/MultiplayerMode.cs`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Host initiates and players join a match (Priority: P1) 🎯 MVP

**Goal**: The host starts a new game and players join the session on a shared screen, displaying the initial phrase and scores.

**Independent Test**: Can be fully tested by creating a lobby, having 2-6 players join, and verifying the game initializes correctly.

### Implementation for User Story 1

- [X] T006 [P] [US1] Create backend `BiblicalRouletteActor` in `backend/src/Dynamo.Application/Actors/BiblicalRouletteActor.cs` to handle initialization and basic state management
- [X] T007 [P] [US1] Create frontend `BiblicalRouletteComponent` in `frontend/src/app/features/sessions/active-match/biblical-roulette/biblical-roulette.component.ts`
- [X] T008 [P] [US1] Create frontend `PhraseBoardComponent` in `frontend/src/app/features/sessions/active-match/biblical-roulette/phrase-board/phrase-board.component.ts`
- [X] T009 [US1] Update `SessionsController` to route `MultiplayerMode.BiblicalRoulette` to the new actor
- [X] T010 [US1] Integrate `BiblicalRouletteComponent` into the main active match routing view

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Players can join and see the phrase board.

---

## Phase 4: User Story 2 - Player takes a turn by spinning the roulette and picking a consonant (Priority: P1)

**Goal**: A player spins the roulette wheel to determine a turn value, then guesses a consonant.

**Independent Test**: Can be tested by forcing a turn, spinning the wheel, picking a consonant, and verifying score calculation based on letters found.

### Implementation for User Story 2

- [X] T011 [P] [US2] Extend `GameHub` with `SpinRoulette()` and `GuessConsonant()` in `backend/src/Dynamo.Api/Hubs/GameHub.cs`
- [X] T012 [US2] Implement turn logic, roulette randomization, and consonant checking in `BiblicalRouletteActor.cs`
- [X] T013 [P] [US2] Create pure Angular `RouletteWheelComponent` with CSS spinning animations in `frontend/src/app/features/sessions/active-match/biblical-roulette/roulette-wheel/roulette-wheel.component.ts`
- [X] T014 [US2] Add keyboard/consonant selection UI to `BiblicalRouletteComponent`
- [X] T015 [US2] Wire `RouletteWheelComponent` to SignalR `RouletteSpun` events to trigger the animation

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Core gameplay loop is established.

---

## Phase 5: User Story 3 - Player purchases a vowel (Priority: P2)

**Goal**: A player uses their accumulated points to purchase a vowel with dynamic pricing instead of guessing a consonant or spinning the wheel.

**Independent Test**: Can be tested by giving a player enough points and verifying they can purchase a vowel and the score deducts accordingly.

### Implementation for User Story 3

- [X] T016 [P] [US3] Extend `GameHub` with `PurchaseVowel()` and `PurchaseHint()` commands
- [X] T017 [US3] Implement dynamic vowel pricing and hint logic in `BiblicalRouletteActor.cs`
- [X] T018 [P] [US3] Create `VowelStoreModalComponent` in `frontend/src/app/features/sessions/active-match/biblical-roulette/vowel-store-modal/vowel-store-modal.component.ts`
- [X] T019 [US3] Add vowel store trigger button and wire to backend in `BiblicalRouletteComponent`

**Checkpoint**: All user stories should now be independently functional. Vowels and hints can be purchased.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T020 [P] Implement "Solve Phrase" feature in frontend and backend to declare a winner
- [X] T021 Apply Neobrutalist design tokens across all new components
- [X] T022 Seed the PostgreSQL database with initial biblical phrases and hints
- [X] T023 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1) -> US2 (P1) -> US3 (P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- Foundational tasks (T002, T004, T005) can be built simultaneously by different agents.
- Within US1, the Actor (T006) and the Components (T007, T008) can be developed in parallel.
- Within US2, the Angular RouletteWheel (T013) can be built independently from the backend logic (T011, T012).
- Within US3, the VowelStoreModal (T018) can be built while the backend logic (T016, T017) is being written.
