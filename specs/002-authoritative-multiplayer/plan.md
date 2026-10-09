# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5+, C# 12 / .NET 8
**Primary Dependencies**: Angular 18+, NgRx Signals, @microsoft/signalr, ASP.NET Core SignalR, EF Core
**Storage**: PostgreSQL (via Supabase)
**Testing**: xUnit, Jasmine/Karma
**Target Platform**: Web browsers, .NET 8 Server
**Project Type**: Web Application (Angular frontend + .NET Backend)
**Performance Goals**: <16ms interaction UI reflection, 10+ ticks per second server broadcast
**Constraints**: Maintain Neobrutalist design, clean architecture, decouple active game state from EF Core
**Scale/Scope**: Lobbies of up to 8 players

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Multiplayer-First Design**: Architecture supports high-frequency realtime interactions via SignalR and actor loops without blocking the database. (Passes)
- **Reusable & Composable Architecture**: Using NgRx Signals for local state management provides reusable reactive primitives across all game types. (Passes)
- **Maintainability**: Moving to an Authoritative Server with Client-side prediction requires clear message contracts to keep the architecture manageable. (Passes)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── Dynamo.Api/          # SignalR GameHub setup
│   ├── Dynamo.Application/  # Background services (Session Actor, TickEngine)
│   ├── Dynamo.Core/         # Clean architecture GameState and Intent models
│   └── Dynamo.Infrastructure/ # Optional EF Core persistence triggers
└── tests/

frontend/
├── src/
│   ├── app/core/
│   │   └── services/        # ConnectionService (SignalR + RxJS), InputService
│   ├── app/features/
│   │   └── game/            # Components utilizing the state
│   └── app/store/           # NgRx SignalStore (AuthoritativeStateMirror, PredictionBuffer)
└── tests/
```

**Structure Decision**: Option 2 (Web application). The project maintains a Clean Architecture .NET backend and an Angular frontend. We will introduce SignalR Hubs on the backend and NgRx SignalStore on the frontend.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
