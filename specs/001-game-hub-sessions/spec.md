# Feature Specification: Game Hub & Session Foundation

**Feature Branch**: `001-game-hub-sessions`

**Created**: 2026-10-07

**Status**: Draft

**Input**: User description: "Build the first functional foundation of the Christian youth games platform: a game hub and a generic multiplayer match/session system, without implementing any actual game."

## Clarifications

### Session 2026-10-07

- Q: When an active match concludes, what should happen to the session and its participants? → A: Session returns to the lobby so the creator can start a new round with the same group.
- Q: When the session creator leaves the lobby, should host privileges transfer or should the session dissolve? → A: Transfer host privileges to the next player in the list, notifying all participants.
- Q: Can a player/client participate in multiple sessions simultaneously? → A: No — one session at a time per player/client.
- Q: Can users navigate backward at every step (hub ← game ← configure ← lobby), and what happens when leaving a lobby? → A: Full back-navigation at every step; leaving the lobby removes the player from the session cleanly.
- Q: What should the default idle timeout be before an unused session expires? → A: 15 minutes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Select a Game (Priority: P1)

A youth leader or player opens the Dynamo platform and lands on the game hub — the main entry point of the platform. The hub displays a collection of available games (placeholder/mock games for now). The user can browse the available games, see basic information about each one (name, description, player count, multiplayer modes supported), and select a game to proceed toward creating or joining a match.

**Why this priority**: The hub is the entry point for every user interaction. Without it, no other flow can begin. It establishes the game discovery surface that all future games will plug into.

**Independent Test**: Can be fully tested by opening the platform and verifying that placeholder games are displayed, browsable, and selectable. Delivers the core navigation entry point.

**Acceptance Scenarios**:

1. **Given** the user opens the platform, **When** the hub loads, **Then** the user sees a list of available games with their names, short descriptions, and supported multiplayer modes.
2. **Given** the hub is displayed with multiple games, **When** the user selects a game, **Then** the platform navigates to the match creation/join flow for that game.
3. **Given** the hub is displayed, **When** there are no games available (empty state), **Then** the user sees a friendly message indicating no games are currently available.

---

### User Story 2 - Create and Configure a Room-Based Match (Priority: P1)

After selecting a game, the user chooses to create a new room-based multiplayer match. The system generates a recognizable session identifier (e.g., a short room code) that other players can use to join. Before starting the match, the creator configures game settings: maximum number of players, number of rounds, time limits, and any game-specific settings exposed by the selected game's configuration schema. The creator then enters the lobby to wait for other players.

**Why this priority**: Room-based multiplayer is one of the two core multiplayer modes. Session creation with configurable settings and a joinable room code is the minimum viable flow for the platform.

**Independent Test**: Can be fully tested by selecting a mock game, creating a session, verifying the room code is generated, configuring settings, and landing in the lobby. Delivers the session creation pipeline.

**Acceptance Scenarios**:

1. **Given** the user has selected a game and chosen room-based multiplayer, **When** the user creates a new match, **Then** the system generates a recognizable, short session identifier (room code).
2. **Given** the session creation flow, **When** the user configures settings (max players, rounds, time limits), **Then** the settings are saved to the session and reflected in the lobby.
3. **Given** the game defines additional game-specific settings, **When** the session creation form loads, **Then** those game-specific settings are rendered dynamically without hard-coding them into the session system.
4. **Given** a session has been created, **When** the creator proceeds, **Then** they land in the lobby screen showing the session identifier, configured settings, and themselves as the first participant.

---

### User Story 3 - Join an Existing Room-Based Match (Priority: P1)

A player wants to join an existing room-based session created by someone else. The player navigates to the join flow, enters the session identifier (room code) and provides their player name. Upon joining, they appear in the lobby alongside other participants. Players can continue joining until the configured player limit is reached.

**Why this priority**: Joining is the complementary half of session creation. Without it, room-based multiplayer is incomplete.

**Independent Test**: Can be fully tested by having one user create a session and another user join via the room code. Delivers the complete room-based multiplayer join flow.

**Acceptance Scenarios**:

1. **Given** a session exists with a known room code, **When** a player enters the room code and their name, **Then** they join the session and appear in the lobby.
2. **Given** a session has a maximum player limit of N, **When** N players have already joined, **Then** additional players are prevented from joining and shown a clear message that the match is full.
3. **Given** a player enters an invalid or expired room code, **When** they attempt to join, **Then** the system displays a friendly error message.
4. **Given** multiple players have joined, **When** a new player joins, **Then** all participants in the lobby see the updated player list in real time.

---

### User Story 4 - Lobby View and Match Start (Priority: P1)

The session creator and all joined players see the lobby screen. The lobby displays the session identifier, the list of participating players, and the configured settings. The session creator has the ability to start the match when the minimum conditions are satisfied (at least the required number of players have joined). Non-creator players wait in the lobby until the match starts.

**Why this priority**: The lobby is the staging area between joining and playing. It is essential for coordinating group sessions and must exist before any game can begin.

**Independent Test**: Can be fully tested by creating a session, joining with multiple players, verifying the lobby displays all participants, and verifying the creator can start the match. Delivers the pre-game coordination screen.

**Acceptance Scenarios**:

1. **Given** the lobby is active, **When** a new player joins, **Then** the player list updates to include the new participant for all users in the lobby.
2. **Given** the lobby is active and the session creator is viewing it, **When** fewer than the minimum required players are present, **Then** the start button is disabled with a message indicating more players are needed.
3. **Given** the lobby has enough players, **When** the creator starts the match, **Then** all participants transition to the active match screen.
4. **Given** the lobby is active, **When** any participant views it, **Then** they see the session identifier, the full player list, and the configured match settings.

---

### User Story 5 - Create and Configure a Shared-Screen Match (Priority: P2)

A user selects a game and chooses shared-screen multiplayer. On a single device (phone, tablet, or projected display), the user creates a session with a recognizable name/identifier and configures match settings. The user then registers multiple players by entering each player's name one at a time. The system tracks the ordered list of players and maintains the distinction between the single client/device and the individual players using it.

**Why this priority**: Shared-screen mode is the second core multiplayer mode, essential for in-person youth group gatherings where a single device is passed around or projected. It is slightly lower priority than room-based because it can be built on the same session foundation.

**Independent Test**: Can be fully tested on a single device by creating a shared-screen session, registering multiple players, and verifying the player list and turn order. Delivers the local multiplayer registration flow.

**Acceptance Scenarios**:

1. **Given** the user has selected a game and chosen shared-screen multiplayer, **When** the user creates a session, **Then** the system creates a session associated with a single client and prompts the user to register players.
2. **Given** the player registration screen, **When** the user enters a player name and confirms, **Then** the player is added to the ordered player list.
3. **Given** multiple players have been registered, **When** the user views the player list, **Then** players are displayed in their registration order.
4. **Given** the maximum player limit is reached, **When** the user attempts to add another player, **Then** the system prevents it and displays a message that the limit has been reached.
5. **Given** at least the minimum number of players have been registered, **When** the user starts the match, **Then** the system transitions to the active match view identifying the first player as the current participant.

---

### User Story 6 - Active Session and Turn Representation (Priority: P2)

Once a match starts (in either multiplayer mode), the system represents the active session with its full participant list and current state. For shared-screen sessions, the system tracks turn order, identifying the current active player and supporting progression to the next player's turn. The session screen displays whose turn it is and the list of all participants. No game-specific rules, scoring, or gameplay are implemented — the session simply provides the foundation for a game to plug into.

**Why this priority**: The active session representation is the handoff point to future game implementations. It completes the full lifecycle: hub → configuration → lobby → active session. Turn management is essential for shared-screen games.

**Independent Test**: Can be fully tested by starting a match and verifying that the active session displays participants, identifies the current player in shared-screen mode, and supports advancing to the next turn. Delivers the match lifecycle skeleton.

**Acceptance Scenarios**:

1. **Given** a room-based match has started, **When** the active session is displayed, **Then** all participants see the session identifier, the list of players, and a placeholder area where game content will appear.
2. **Given** a shared-screen match has started, **When** the active session is displayed, **Then** the system identifies the current player (whose turn it is) and displays the full ordered player list.
3. **Given** a shared-screen match is active and it is Player A's turn, **When** the turn is advanced (manually, since no game rules exist), **Then** the system moves to the next player in the ordered list.
4. **Given** the last player in the turn order has completed their turn, **When** the turn advances, **Then** the system wraps around to the first player.
5. **Given** an active session (either mode), **When** the session is displayed, **Then** a placeholder area is visible indicating where game-specific content will render, without any game logic implemented.

---

### Edge Cases

- What happens when a player tries to join a session that has already started? The system MUST prevent late joins and display a message that the match is in progress.
- What happens when the session creator leaves the lobby before starting the match? The system MUST transfer host privileges to the next player in the participant list and notify all remaining participants of the host change.
- What happens when a player in a shared-screen session has the same name as another? The system MUST prevent duplicate player names within a single session and prompt the user to enter a different name.
- What happens when the room code is entered with different casing or extra whitespace? The system MUST normalize input (trim whitespace, handle case insensitivity if applicable) before matching.
- What happens when a player loses connection during the lobby phase of a room-based match? The system MUST remove disconnected players from the lobby after a timeout and update the player list for remaining participants.
- What happens when a session is created but no one joins within a reasonable time? The session MUST remain valid for a default idle timeout of 15 minutes, after which it expires and is cleaned up. This timeout MUST be configurable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a game hub as the main entry point, listing all registered games with their name, description, and supported multiplayer modes.
- **FR-002**: The system MUST support game registration through a plug-in mechanism where games declare their metadata (name, description, icon, supported modes, settings schema) without the hub having knowledge of game-specific implementation.
- **FR-003**: The system MUST allow users to create a new session for a selected game by choosing a multiplayer mode (room-based or shared-screen) and configuring match settings.
- **FR-004**: The system MUST generate a short, recognizable, human-friendly session identifier (room code) for every room-based session.
- **FR-005**: The system MUST support configurable match settings including: maximum number of players, number of rounds, and time limits.
- **FR-006**: The system MUST support extensible, game-specific settings that are defined by each game's configuration schema and rendered dynamically during session creation, without the session model being aware of individual game rules.
- **FR-007**: The system MUST allow players to join a room-based session by entering the session identifier and providing a player name.
- **FR-008**: The system MUST enforce the configured maximum player limit, preventing additional joins once the limit is reached.
- **FR-009**: The system MUST display a lobby screen showing the session identifier, configured settings, and a live-updating list of participating players.
- **FR-010**: The system MUST allow only the session creator to start the match, and only when the minimum player requirements are satisfied.
- **FR-011**: The system MUST support shared-screen sessions where multiple players are registered under a single client/device, each identified by a player name.
- **FR-012**: The system MUST maintain a clear distinction between the client/device participating in the session and the individual players registered under that client.
- **FR-013**: The system MUST support an ordered player list for shared-screen sessions and track which player is the current active participant (turn tracking).
- **FR-014**: The system MUST support advancing from one player's turn to the next in a cyclic fashion (wrapping from last player to first).
- **FR-015**: The system MUST prevent duplicate player names within a single session.
- **FR-016**: The system MUST represent an active session with its participants and provide a placeholder rendering area where future game-specific content will be displayed.
- **FR-017**: The system MUST prevent players from joining a session that has already transitioned from lobby to active match.
- **FR-018**: The system MUST normalize session identifier input (trim whitespace, handle case) when players attempt to join.
- **FR-019**: When the session creator (host) leaves the lobby, the system MUST transfer host privileges to the next player in the participant list and notify all remaining participants of the host change.
- **FR-020**: The system MUST use placeholder/mock game registrations to demonstrate the complete hub-to-session flow in the absence of real game implementations.
- **FR-021**: When an active match concludes (the game signals completion), the system MUST return all participants to the lobby with the same session configuration and player roster, allowing the creator to start a new round without re-creating the session.
- **FR-022**: A client MUST only participate in one session at a time. Attempting to join a new session while already in one MUST require the player to leave the current session first.
- **FR-023**: The system MUST allow users to navigate back at every step of the flow (hub ← game selection ← session configuration ← lobby) without losing the ability to restart or choose a different path.
- **FR-024**: When a non-host player leaves the lobby (navigates back or disconnects), the system MUST remove them from the session cleanly and update the participant list for all remaining players.
- **FR-025**: Sessions with no activity (no players joining, no match started) MUST expire after a configurable idle timeout, defaulting to 15 minutes. Expired sessions MUST be cleaned up and their room codes released for reuse.

### Key Entities

- **Game**: A registered game available on the platform. Defined by name, description, icon/thumbnail, supported multiplayer modes, and a settings schema. Games are registered via the platform's extensible game registry — they are not hard-coded.
- **Session**: A configured instance of a match for a specific game. Contains the selected game reference, multiplayer mode, configured settings, session identifier (room code), lifecycle state (configuring → lobby → active → lobby [rematch] → ended), and references to its participants. After an active match concludes, the session transitions back to the lobby state so the creator can start another round with the same group. A session is game-agnostic — it does not contain game rules or scoring.
- **Client**: A connected device/browser participating in a session. In room-based mode, each client typically represents one player. In shared-screen mode, a single client hosts multiple players.
- **Player**: An individual participant in a session, identified by a player name. In room-based mode, a player maps 1:1 to a client. In shared-screen mode, multiple players belong to the same client. Players have an order within the session (relevant for turn-based shared-screen play).
- **Game Settings Schema**: A declarative definition provided by each game that describes the configurable parameters for that game (field names, types, defaults, constraints). The session system renders these dynamically without understanding the game's rules.
- **Turn State**: For shared-screen sessions, the tracking of which player in the ordered list is the current active participant, with the ability to cycle through the player order.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can navigate from the hub to an active match lobby in under 30 seconds, including game selection, session creation or join, and name entry.
- **SC-002**: A youth leader can create a shared-screen session and register 8 players in under 2 minutes.
- **SC-003**: The hub correctly displays all registered mock games with their metadata on first load, with no missing or broken entries.
- **SC-004**: Room codes are immediately recognizable and communicable verbally (short, unambiguous characters) — a player can hear a room code spoken aloud and enter it correctly on the first attempt in 90% of cases.
- **SC-005**: The lobby player list updates within 2 seconds of a new player joining or disconnecting.
- **SC-006**: The session system renders game-specific settings dynamically from the game's declared schema without any session-level code changes.
- **SC-007**: The platform operates correctly on mobile phones (portrait), tablets (landscape), and projected/large-screen displays without layout breakage.
- **SC-008**: All user-facing text, labels, and messages are appropriate for a Christian youth audience, free of any inappropriate language or themes.
- **SC-009**: Turn advancement in shared-screen mode cycles through all registered players in order and wraps correctly from the last player to the first.

## Assumptions

- This is the first feature of the Dynamo platform — there is no existing codebase, authentication system, or backend infrastructure to integrate with.
- No user accounts or persistent authentication are required. Players are identified by name within the context of a session only.
- Room-based multiplayer requires real-time communication between clients (the specific protocol is a technical decision deferred to planning).
- Shared-screen multiplayer operates entirely on a single client — no networking is required for player-to-player interaction in this mode.
- Placeholder/mock games will be used to demonstrate the hub and session flow. These mocks declare metadata and settings schemas but contain no actual game logic.
- The platform is a web-based application accessible via browser on phones, tablets, and desktop/projected screens.
- Session persistence is ephemeral — sessions exist only while active and are not stored long-term.
- The visual design will follow the neobrutalist direction established in the constitution, but specific design tokens and components will be defined during the planning phase.
