# API Contracts: Game Hub & Session Foundation

## REST API (Base URL: `/api/v1`)

### Games
- `GET /games`
  - Returns a list of mock games available in the hub.
  - **Response**: `Game[]`

### Sessions
- `POST /sessions`
  - Creates a new session.
  - **Request**: `{ gameId: string, mode: MultiplayerMode, hostClientId: string, settings: { ... } }`
  - **Response**: `Session` (includes generated `roomCode` and `id`)

- `GET /sessions/code/{roomCode}`
  - Retrieves a session by its room code (for joining).
  - **Response**: `Session`

- `PUT /sessions/{id}/state`
  - Updates the session state (e.g., from `Lobby` to `Active`).
  - **Request**: `{ state: SessionState }`
  - **Response**: `Session`

### Players
- `POST /sessions/{sessionId}/players`
  - Registers a new player in a session.
  - **Request**: `{ clientId: string, name: string }`
  - **Response**: `Player`

- `DELETE /sessions/{sessionId}/players/{playerId}`
  - Removes a player from the session (e.g., if they leave or disconnect).

## Real-time Events (Supabase Realtime / SignalR)

Channel: `session:{sessionId}`

- `PlayerJoined`
  - Payload: `Player`
- `PlayerLeft`
  - Payload: `{ playerId: string, newHostClientId?: string }`
- `SessionStateChanged`
  - Payload: `{ state: SessionState }`
- `TurnAdvanced`
  - Payload: `{ activePlayerId: string }`
