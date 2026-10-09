# Data Model & State Boundaries: Authoritative Multiplayer Engine

## 1. Game State (In-Memory Canonical State)

The `GameState` represents the authoritative source of truth maintained by the Session Actor on the server. This state is NOT mapped to EF Core entities for persistence.

```typescript
// Shared Interface (Frontend/Backend equivalent)
interface GameState {
  sequenceNumber: number; // Incrementing tick ID
  sessionId: string;
  status: 'Lobby' | 'Starting' | 'InProgress' | 'Finished';
  serverTimeMs: number;
  players: Record<string, PlayerState>;
  // Game-specific payload (e.g., current question, buzzer states)
  payload: any; 
}

interface PlayerState {
  clientId: string;
  score: number;
  isConnected: boolean;
  lastAcknowledgedInputSequence: number; // Critical for reconciliation
}
```

## 2. Intent (Client Input)

Intents are inputs captured by the client and sent to the server. They are stored in the client's `PredictionBuffer`.

```typescript
interface PlayerIntent {
  inputSequence: number; // Client-side incrementing ID
  clientId: string;
  timestamp: number;
  actionType: string; // e.g., 'BUZZ_IN', 'ANSWER_SELECTED'
  payload: any;
}
```

## 3. Server Updates (Deltas/Snapshots)

The server broadcasts updates at every tick.

```typescript
interface StateSnapshot {
  sequenceNumber: number;
  fullState: GameState;
}

interface StateDelta {
  sequenceNumber: number;
  patch: any; // JSON Patch or partial object representing changes
}
```

## 4. Persistent Models (EF Core)

EF Core models are only used at the start and end of a session.

- **Session**: Retains metadata (HostId, Code).
- **MatchResult**: Created at the end of the session, persisting final scores and analytics. (Decoupled from high-frequency updates).
