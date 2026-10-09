# Tasks: Authoritative Multiplayer Engine

**Input**: Design documents from `/specs/002-authoritative-multiplayer/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/signalr-hub.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Install `@microsoft/signalr` and `@ngrx/signals` in `frontend/package.json`
- [ ] T002 [P] Register SignalR services in `backend/src/Dynamo.Api/Program.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create `GameState`, `PlayerState`, `PlayerIntent`, `StateSnapshot`, and `StateDelta` models in `backend/src/Dynamo.Core/Models/GameTypes.cs`
- [ ] T004 [P] Create equivalent TypeScript interfaces in `frontend/src/app/core/models/game-state.model.ts`
- [ ] T005 Setup `GameHub` with basic connection and group mapping in `backend/src/Dynamo.Api/Hubs/GameHub.cs`
- [ ] T006 Implement `ConnectionService` wrapping SignalR in RxJS in `frontend/src/app/core/services/connection.service.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 - High-Frequency Game State Distribution (Priority: P1)

**Goal**: As a host displaying the game on a shared screen, I want the animations and state changes from multiple players' inputs to render smoothly and accurately in real-time. (Server-side Tick Engine)

**Independent Test**: Have multiple clients send inputs simultaneously; verify the server processes them in a tick loop and broadcasts the aggregated state update.

### Implementation for User Story 3

- [ ] T007 [P] [US3] Implement `SessionActor` background task loop using `System.Threading.Channels` in `backend/src/Dynamo.Application/Services/SessionActor.cs`
- [ ] T008 [US3] Implement `SessionActorManager` to spawn and manage actors per active SessionId in `backend/src/Dynamo.Application/Services/SessionActorManager.cs`
- [ ] T009 [US3] Update `GameHub.cs` to enqueue received `PlayerIntent` into the corresponding `SessionActor`'s channel
- [ ] T010 [US3] Implement state broadcast logic in `SessionActor.cs` to emit `StateDelta` via `IHubContext` at 10Hz

**Checkpoint**: Server tick engine is fully functional and broadcasting updates.

---

## Phase 4: User Story 1 - Real-Time Gameplay Interactivity (Priority: P1)

**Goal**: As a player, I want my actions to appear instantly on screen without waiting for network confirmation (Client-Side Prediction & Reconciliation).

**Independent Test**: Trigger an action while briefly disconnecting the internet; the action should reflect locally immediately.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create NgRx SignalStore in `frontend/src/app/store/game.store.ts` for the `AuthoritativeStateMirror`
- [ ] T012 [US1] Implement `PredictionBuffer` logic within `game.store.ts` to optimistically apply inputs
- [ ] T013 [P] [US1] Implement `InputService` in `frontend/src/app/core/services/input.service.ts` to capture intents, update the `PredictionBuffer`, and send via `ConnectionService`
- [ ] T014 [US1] Update `GameStore` to subscribe to `ConnectionService` deltas and implement the Reconciler (rollback if rejected)
- [ ] T015 [US1] Refactor `frontend/src/app/features/hub/hub.component.ts` to read state from `GameStore` signals instead of polling

**Checkpoint**: Client can predict inputs and reconcile with the server's high-frequency broadcasts.

---

## Phase 5: User Story 2 - Seamless Reconnection & Recovery (Priority: P2)

**Goal**: As a player on a mobile network, I want to seamlessly reconnect and receive the latest game state if I briefly lose connection.

**Independent Test**: Turn off Wi-Fi for 5 seconds; the client automatically reconnects, fetches the latest snapshot, and resumes.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Update `ConnectionService` (`connection.service.ts`) to handle `onclose` and exponential backoff reconnect logic
- [ ] T017 [US2] Add `RequestSnapshot` to `GameHub.cs` and handle returning full state sync in `SessionActor.cs`
- [ ] T018 [US2] Update `GameStore` to process full `StateSnapshot` events to catch up after a reconnect

**Checkpoint**: Reconnection and full state resync works smoothly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T019 [P] Disable the legacy EF Core 2-second polling logic in frontend components
- [ ] T020 Refactor `SessionCleanupWorker` or introduce match-end hooks to persist final match data from `SessionActor` to EF Core
- [ ] T021 Run quickstart.md validation scenarios to verify end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US3 (Server Tick Engine) provides the backend infrastructure that US1 (Client Prediction) depends on, so it is logically sequenced first, but client models (US1) can be developed in parallel against the contract.
  - US2 (Reconnection) depends on US3 (Server) and US1 (Client) being largely complete.

### Within Each User Story

- Models before services
- Services before endpoints/hubs
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can be run simultaneously.
- Core Models (T003 and T004) can be built in parallel.
- US3 Server Logic (T007) and US1 Client SignalStore (T011) can be developed in parallel since they agree on the `GameHub` contract.

---

## Parallel Example: Setup & Foundational

```bash
# Frontend Setup
Task: "Install @microsoft/signalr and @ngrx/signals in frontend/package.json"
Task: "Create equivalent TypeScript interfaces in frontend/src/app/core/models/game-state.model.ts"

# Backend Setup
Task: "Register SignalR services in backend/src/Dynamo.Api/Program.cs"
Task: "Create GameState, PlayerState... in backend/src/Dynamo.Core/Models/GameTypes.cs"
```

---

## Implementation Strategy

### MVP First (US3 & US1)

1. Complete Phase 1 & 2: Setup and Foundation
2. Complete Phase 3 (US3) to establish the ticking server.
3. Complete Phase 4 (US1) to establish the reactive frontend.
4. **STOP and VALIDATE**: Test real-time synchronization locally.

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US3 + US1 → Test independently → Local network play possible
3. Add US2 → Test independently → Stable for production mobile networks
