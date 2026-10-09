# Feature Specification: Authoritative Multiplayer Engine

**Feature Branch**: `[002-authoritative-multiplayer]`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "We need to transition the current Dynamo multiplayer architecture from the initial REST-based polling implementation to a high-frequency, Authoritative Game Server architecture using SignalR and Actor-based simulation..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Gameplay Interactivity (Priority: P1)

As a player, I want my actions to appear instantly on screen without waiting for network confirmation, so that the game feels highly responsive and smooth.

**Why this priority**: Fast-paced games (e.g., trivia buzzer, fast charades) require immediate feedback to remain engaging and fair. Latency kills the experience.

**Independent Test**: Can be tested by disconnecting the internet connection briefly while taking an action; the action should still reflect locally immediately, then sync when reconnected.

**Acceptance Scenarios**:

1. **Given** a player presses a buzzer button, **When** the input is triggered, **Then** the local screen immediately reflects the button as pressed (Client-Side Prediction).
2. **Given** a player submits an input, **When** the server rejects or modifies the outcome (e.g., another player buzzed in first), **Then** the local client rolls back the state and gracefully applies the server's authoritative outcome (Reconciliation).

---

### User Story 2 - Seamless Reconnection & Recovery (Priority: P2)

As a player participating on a mobile network, I want to seamlessly reconnect and receive the latest game state if I briefly lose connection, without missing my turn or having to refresh the page.

**Why this priority**: Mobile connections at youth group events drop frequently. The system must handle brief disconnects invisibly to the user.

**Independent Test**: Can be tested by turning off Wi-Fi for 5 seconds and turning it back on; the game should automatically reconnect, fetch the latest snapshot, and continue without a full page reload.

**Acceptance Scenarios**:

1. **Given** a player loses websocket connection, **When** the connection drops, **Then** the client automatically attempts to reconnect with backoff strategies.
2. **Given** a player reconnects after missing events, **When** the connection is re-established, **Then** the client fetches the latest full authoritative state snapshot from the server to catch up.

---

### User Story 3 - High-Frequency Game State Distribution (Priority: P1)

As a host displaying the game on a shared screen, I want the animations and state changes from multiple players' inputs to render smoothly and accurately in real-time.

**Why this priority**: For shared-screen multiplayer modes (like Faith Charades), multiple players are sending inputs simultaneously. The central screen needs a constant, reliable stream of updates to animate transitions properly.

**Independent Test**: Have 8 clients rapidly send inputs simultaneously; the host screen should process and render the outcome fluidly without freezing or stuttering.

**Acceptance Scenarios**:

1. **Given** an active game session, **When** multiple players submit inputs within the same server tick, **Then** the server aggregates them and broadcasts a single consolidated state update to all clients.
2. **Given** the host screen is observing the session, **When** receiving server deltas, **Then** the screen smoothly blends the states together.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support a constant, real-time bidirectional connection between clients and the server instead of periodic polling.
- **FR-002**: The client MUST capture user inputs and locally predict their outcome instantly in a "Prediction Buffer" before server acknowledgment.
- **FR-003**: The client MUST implement a state reconciler that compares local predicted state with the incoming authoritative server state, and applies necessary rollbacks or corrections.
- **FR-004**: The server MUST process sessions via an isolated simulation loop that runs independently for each active game room.
- **FR-005**: The server MUST maintain an input queue for each session, process those inputs during its tick loop, and broadcast state updates (snapshots or deltas) to all connected clients at a fixed frequency.
- **FR-006**: The system MUST automatically handle connection interruptions with exponential backoff and request a fresh state snapshot upon successful reconnection.
- **FR-007**: The system MUST persist final match outcomes, statistics, and metadata to durable storage asynchronously (e.g., at game end) to prevent database bottlenecks during active, high-frequency gameplay.

### Key Entities

- **ConnectionService**: Manages the persistent socket connection, backoff/retry logic, and streams incoming/outgoing messages.
- **InputService**: Captures local intents, stores them in a prediction buffer, and dispatches them to the server.
- **AuthoritativeStateMirror**: The local client copy of the last known confirmed server state.
- **SessionActor (Server)**: An isolated simulation container on the backend that owns the single source of truth (Canonical State) for one active match.
- **TickEngine**: The server-side loop that dequeues inputs, applies logic, and broadcasts out the state at a steady rate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User interactions (button presses, selections) reflect on the UI in under 16ms (1 frame) regardless of actual network latency.
- **SC-002**: The server can handle inputs and broadcast state to a full lobby of 8 players at 10+ ticks per second without degrading.
- **SC-003**: The system automatically reconnects and resynchronizes a dropped client within 2 seconds of the network returning.
- **SC-004**: The backend's durable database experiences exactly zero write operations during the active high-frequency phase of a match, deferring writes to checkpoints or match-end.

## Assumptions

- This transition requires adopting a real-time framework (SignalR) on the backend and RxJS stream handling on the frontend.
- Game states can be serialized efficiently enough to be broadcast at high frequencies.
- Client devices have enough processing power to handle local prediction and state reconciliation loops.
- The Neobrutalist design system will be maintained; this architectural shift affects the underlying engine and data flow, not the UI components.
- The clean architecture layers remain intact, meaning the core game logic can run identically on both the server (for authoritative execution) and the client (for prediction).
