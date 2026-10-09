# Implementation Plan: Biblical Roulette

**Branch**: `main` | **Date**: 2026-10-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-biblical-roulette/spec.md`

## Summary

Implement the Biblical Roulette game using an Authoritative Game Server approach via SignalR and Actor-based simulation in .NET 8, with an Angular/NgRx frontend. The backend will manage all game state, scoring, vowel point scaling, and turn sequencing. The frontend will render the state, including a custom Angular-based animated roulette wheel without external libraries, and a modal for purchasing vowels.

## Technical Context

**Language/Version**: C# 12 (.NET 8) / TypeScript (Angular)

**Primary Dependencies**: ASP.NET Core SignalR, NgRx SignalStore, Entity Framework Core

**Storage**: PostgreSQL (for phrases/verses)

**Testing**: xUnit (Backend), Jasmine/Karma (Frontend)

**Target Platform**: Web Browsers (Mobile and Desktop)

**Project Type**: Real-time Multiplayer Web Application

**Performance Goals**: State synchronization <500ms, smooth 60fps roulette animation

**Constraints**: Roulette MUST be built with pure Angular components and CSS animations (no external charting or wheel libraries). Vowel purchase MUST be a modal. All game logic MUST execute on the backend.

**Scale/Scope**: Up to 6 concurrent players plus 1 shared screen per game session.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Wholesome & Safe Environment**: PASS. Game logic prevents inappropriate content; phrases sourced from DB.
- **II. Extensible Games Platform**: PASS. The game will be implemented as a new game type within the existing `SessionActor` / `GameHub` architecture.
- **III. Multiplayer-First Design**: PASS. Fully utilizes the authoritative server / real-time sync model.
- **IV. Reusable & Composable Architecture**: PASS. Leverages existing `RealtimeService` and `SessionActor` patterns.
- **V. Content–Logic Separation**: PASS. Phrases and hints are stored in DB, separate from game logic.
- **VI. Simplicity & Fast Onboarding**: PASS. Vowel purchases in a simple modal, roulette interaction via one tap.
- **VII. Neobrutalist Visual Identity**: PASS. Roulette and modal will adhere to the neobrutalist SCSS tokens.
- **VIII. Maintainability & Pragmatic Engineering**: PASS. Pure Angular roulette avoids external dependency bloat.

## Project Structure

### Documentation (this feature)

```text
specs/003-biblical-roulette/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── game-state.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Dynamo.Api/
│   │   └── Hubs/
│   ├── Dynamo.Core/
│   │   ├── Models/
│   │   └── Enums/
│   └── Dynamo.Application/
│       └── Actors/
└── tests/

frontend/
├── src/
│   ├── app/
│   │   └── features/
│   │       └── sessions/
│   │           └── active-match/
│   │               ├── biblical-roulette/
│   │               │   ├── roulette-wheel/
│   │               │   ├── vowel-store-modal/
│   │               │   ├── phrase-board/
│   │               │   └── biblical-roulette.component.ts
│   └── styles.scss
└── tests/
```

**Structure Decision**: Integrated into the existing web application structure, adding a new game type directory in the frontend and extending the backend models/actors.

## Complexity Tracking

*No violations.*
