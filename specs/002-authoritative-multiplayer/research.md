# Phase 0: Research & Decisions

## Context
Transitioning Dynamo's multiplayer architecture from REST polling to a high-frequency, Authoritative Game Server using SignalR (.NET 8) and NgRx Signals (Angular).

## Decisions

### Frontend State Management (State Mirror & Prediction)
- **Decision**: Use **NgRx SignalStore** to implement the `AuthoritativeStateMirror`, `PredictionBuffer`, and `Reconciler`.
- **Rationale**: The user explicitly requested using NgRx Signals. SignalStore provides a lightweight, highly reactive, and granular reactivity model that perfectly aligns with fast-changing game state loops, allowing UI components to re-render precisely without Redux boilerplate.
- **Alternatives considered**: Traditional NgRx Store (too heavy/boilerplate for 10+ ticks per second), RxJS BehaviorSubjects (lack structured state slice management).

### Real-Time Connection
- **Decision**: Use **@microsoft/signalr** integrated with an Angular `ConnectionService` returning RxJS Observables.
- **Rationale**: Native integration with .NET 8's SignalR backend. Wrapping SignalR events in RxJS allows easy mapping, filtering, and combination with NgRx SignalStore's `rxMethod`.
- **Alternatives considered**: Raw WebSockets (lacks built-in reconnection, fallback, and group management).

### Server-Side Simulation Loop (Session Actor)
- **Decision**: Implement a `BackgroundService` or dedicated `Task` per active `SessionId` acting as the "Session Actor", utilizing `System.Threading.Channels` for the input queue.
- **Rationale**: SignalR Hub methods are transient and executed on thread pool threads. A continuous ticking loop (e.g., 10 ticks/sec) needs its own long-running context. Channels provide a highly efficient, thread-safe queue for capturing player inputs from the Hub, which the Session Actor dequeues and processes during its tick.
- **Alternatives considered**: Akka.NET / Microsoft Orleans (overkill for the current scale, introduces significant infrastructural complexity compared to a simple Channel + Task model).

### Database Persistence
- **Decision**: Decouple active game state from EF Core entirely.
- **Rationale**: Persisting 10+ updates per second to Supabase/PostgreSQL is anti-pattern and will cause severe bottlenecks. The Session Actor holds the authoritative state in-memory and only flushes to EF Core at critical checkpoints or match completion.
- **Alternatives considered**: Redis for active state (adds infrastructure dependency; memory is sufficient for now since sessions are transient and short-lived).
