# Tasks: Game Hub & Session Foundation

**Input**: Design documents from `/specs/001-game-hub-sessions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize backend .NET solution with Clean Architecture layers in `backend/` (`Dynamo.Core`, `Dynamo.Application`, `Dynamo.Infrastructure`, `Dynamo.Api`)
- [X] T002 Initialize frontend Angular workspace in `frontend/`
- [X] T003 [P] Configure Tailwind CSS with Neobrutalist tokens in `frontend/tailwind.config.js` and `frontend/src/styles.scss`
- [X] T004 [P] Configure Supabase client connection strings in `backend/src/Dynamo.Api/appsettings.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create base Entity and IRepository interfaces in `backend/src/Dynamo.Core/Common/`
- [X] T006 Setup EF Core / Supabase DbContext in `backend/src/Dynamo.Infrastructure/Data/DynamoDbContext.cs`
- [X] T007 Configure REST API routing and base controller in `backend/src/Dynamo.Api/Controllers/BaseController.cs`
- [X] T008 [P] Set up core Angular App routing shell and Neobrutalist layout component in `frontend/src/app/app.routes.ts` and `frontend/src/app/core/layout/`
- [X] T009 [P] Configure Angular Supabase service wrapper in `frontend/src/app/core/services/supabase.service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse and Select a Game (Priority: P1) 🎯 MVP

**Goal**: Display a game hub listing all registered games with their metadata, allowing a user to browse and select a mock game.

**Independent Test**: Load the Angular frontend homepage; verify it lists mock games (e.g., "Trivia Pro") retrieved from the backend API.

### Implementation for User Story 1

- [X] T010 [P] [US1] Create `Game` entity and `MultiplayerMode` enum in `backend/src/Dynamo.Core/Entities/Game.cs`
- [X] T011 [P] [US1] Implement `GetGamesQuery` use case in `backend/src/Dynamo.Application/Games/Queries/GetGamesQuery.cs`
- [X] T012 [US1] Implement `GET /api/v1/games` endpoint in `backend/src/Dynamo.Api/Controllers/GamesController.cs`
- [X] T013 [P] [US1] Create `Game` interface in `frontend/src/app/core/models/game.model.ts`
- [X] T014 [US1] Create `GameService` to fetch games in `frontend/src/app/core/services/game.service.ts`
- [X] T015 [US1] Implement Game Hub page UI with Neobrutalist game cards in `frontend/src/app/features/hub/hub.component.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create Room-Based Match (Priority: P1)

**Goal**: Allow a user to create a session for a selected game and get a room code.

**Independent Test**: Click a game in the hub, select Room-Based, configure settings, and receive a room code leading to the lobby.

### Implementation for User Story 2

- [X] T016 [P] [US2] Create `Session` entity and `SessionState` enum in `backend/src/Dynamo.Core/Entities/Session.cs`
- [X] T017 [P] [US2] Create `Client` entity in `backend/src/Dynamo.Core/Entities/Client.cs`
- [X] T018 [US2] Implement `CreateSessionCommand` (generates room code) in `backend/src/Dynamo.Application/Sessions/Commands/CreateSessionCommand.cs`
- [X] T019 [US2] Implement `POST /api/v1/sessions` endpoint in `backend/src/Dynamo.Api/Controllers/SessionsController.cs`
- [X] T020 [P] [US2] Create `Session` and `Client` models in `frontend/src/app/core/models/session.model.ts`
- [X] T021 [US2] Implement `SessionService.createSession()` in `frontend/src/app/core/services/session.service.ts`
- [X] T022 [US2] Implement match configuration form UI in `frontend/src/app/features/sessions/configure/configure.component.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Join Room-Based Match (Priority: P1)

**Goal**: Allow players to join an existing session using a room code.

**Independent Test**: Enter an active room code and player name to join the session.

### Implementation for User Story 3

- [X] T023 [P] [US3] Create `Player` entity in `backend/src/Dynamo.Core/Entities/Player.cs`
- [X] T024 [P] [US3] Implement `JoinSessionCommand` in `backend/src/Dynamo.Application/Sessions/Commands/JoinSessionCommand.cs`
- [X] T025 [P] [US3] Implement `GetSessionByCodeQuery` in `backend/src/Dynamo.Application/Sessions/Queries/GetSessionByCodeQuery.cs`
- [X] T026 [US3] Implement `POST /api/v1/sessions/{id}/players` and `GET /api/v1/sessions/code/{code}` endpoints in `backend/src/Dynamo.Api/Controllers/SessionsController.cs`
- [X] T027 [P] [US3] Create `Player` model in `frontend/src/app/core/models/player.model.ts`
- [X] T028 [US3] Implement join UI form (room code + name input) in `frontend/src/app/features/sessions/join/join.component.ts`

**Checkpoint**: Users can now create and join sessions.

---

## Phase 6: User Story 4 - Lobby View and Match Start (Priority: P1)

**Goal**: Real-time lobby displaying participants, and the ability for the host to start the match.

**Independent Test**: Two browser windows connect to the same lobby. When one joins, the other sees it instantly. Host clicks start, both transition.

### Implementation for User Story 4

- [X] T029 [P] [US4] Configure Supabase Realtime / SignalR Hub in `backend/src/Dynamo.Api/Hubs/SessionHub.cs`
- [X] T030 [US4] Emit `PlayerJoined` and `PlayerLeft` events from application layer in `backend/src/Dynamo.Application/Sessions/Commands/`
- [X] T031 [US4] Implement `ChangeSessionStateCommand` and `PUT /api/v1/sessions/{id}/state` endpoint in `backend/src/Dynamo.Api/Controllers/SessionsController.cs`
- [X] T032 [P] [US4] Implement real-time listener in Angular `frontend/src/app/core/services/realtime.service.ts`
- [X] T033 [US4] Implement Lobby UI showing player list in `frontend/src/app/features/sessions/lobby/lobby.component.ts`
- [X] T034 [US4] Implement Host "Start Match" logic (transitioning to Active state) in `lobby.component.ts`

**Checkpoint**: Room-based multiplayer coordination is complete.

---

## Phase 7: User Story 5 - Create Shared-Screen Match (Priority: P2)

**Goal**: A local multiplayer mode where multiple players register on a single device.

**Independent Test**: Create a shared-screen session and register multiple players locally before starting.

### Implementation for User Story 5

- [X] T035 [US5] Implement local player registration flow (bypassing room code join) in `frontend/src/app/features/sessions/shared-screen-setup/shared-screen-setup.component.ts`
- [X] T036 [US5] Update backend session creation to handle bulk local player injection for Shared-Screen mode in `backend/src/Dynamo.Application/Sessions/Commands/CreateSharedScreenSessionCommand.cs`

---

## Phase 8: User Story 6 - Active Session and Turn Representation (Priority: P2)

**Goal**: Display the active match container and track turns for shared-screen mode.

**Independent Test**: Once a match starts, cycle through player turns in order.

### Implementation for User Story 6

- [X] T037 [US6] Implement Active Match container UI placeholder in `frontend/src/app/features/sessions/active-match/active-match.component.ts`
- [X] T038 [US6] Implement turn tracking logic (cycle through ordered players) in `frontend/src/app/features/sessions/active-match/turn-tracker.component.ts`
- [X] T039 [US6] Emit `TurnAdvanced` events (if needed for room-based later, or just local state for shared screen) in `backend/src/Dynamo.Api/Controllers/SessionsController.cs`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T040 [P] Implement 15-minute idle session cleanup worker in `backend/src/Dynamo.Infrastructure/Workers/SessionCleanupWorker.cs`
- [X] T041 [P] Implement Host transfer logic on creator departure (FR-019) in `backend/src/Dynamo.Application/Sessions/Commands/LeaveSessionCommand.cs`
- [X] T042 Run `quickstart.md` validation to ensure end-to-end flows operate correctly
- [X] T043 Code cleanup and validation of Neobrutalist design contrast ratios (WCAG AA)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - Phase 3, 4, 5, 6 should generally follow sequentially for the best iterative testing.
  - Phase 7 (US5) and 8 (US6) depend on Phase 4.
- **Polish (Phase 9)**: Depends on all user stories being complete.

### Parallel Opportunities

- T003 and T004 (Config setup) can run while .NET/Angular initialization (T001, T002) is finishing.
- Frontend core (T008, T009) and Backend core (T005, T006, T007) can be built concurrently.
- Once Foundation is complete, Frontend UI development and Backend API/Logic can proceed in parallel for each User Story.
