# Implementation Plan: Roulette Turn Timer, Spin Result Polish, and Hint Cost Adjustment

**Branch**: `007-roulette-turn-timer` | **Date**: 2026-10-24 | **Spec**: [specs/007-roulette-turn-timer/spec.md](spec.md)

**Input**: Feature specification from `specs/007-roulette-turn-timer/spec.md`

## Summary

Implement a backend-authoritative turn countdown timer for Biblical Roulette driven by existing session configuration (`timeLimitSeconds`), featuring a +15 second bonus on the first action of each turn, dynamic resets on turn actions (`SPIN_ROULETTE`, `PURCHASE_VOWEL`, `PURCHASE_HINT`), and automatic pauses during modals and wheel spinning. Redesign the Spin Result modal to be wider, auto-dismiss in 3 seconds (preserving an early manual "Continuar" option), and display points as plain inline text. Calibrate the specific hint cost to 5,000 points across the stack. All implementation strictly adheres to the zero-new-library constraint.

## Technical Context

**Language/Version**: C# 12 (.NET 8.0) for backend actor; TypeScript 5.5 / Angular 18.2 for frontend.

**Primary Dependencies**: ASP.NET Core SignalR, Entity Framework Core (InMemory/SQLite), Angular Signals (`signal`, `computed`, `effect`), Tailwind CSS 3.4. **Zero new libraries required.**

**Storage**: In-memory actor state (`BiblicalRouletteState`) and EF Core `DynamoDbContext` for session configuration (`Session.TimeLimitSeconds`).

**Testing**: xUnit with .NET test runner (`dotnet test`) for backend actor turn timers and hint costs; Angular build verification (`npm run build`).

**Target Platform**: Modern web browsers (desktop, mobile, projected/shared displays).

**Project Type**: Web application (ASP.NET Core backend + Angular frontend).

**Performance Goals**: Sub-second timer synchronization ($\pm 250$ms), smooth 60fps wheel spin and pulse animation, instant turn transition upon timeout.

**Constraints**:
- Zero new libraries or dependencies (use native .NET 8 async primitives and Angular built-ins).
- Strictly preserve existing game mechanics and neobrutalist aesthetic.
- Backward compatibility with existing session configuration (`timeLimitSeconds`).

**Scale/Scope**: 1-16 players per session, 3 rounds per match, real-time SignalR state broadcasting.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evaluation |
|-----------|--------|------------|
| **I. Wholesome & Safe Environment** | **PASS** | Keeps youth group games brisk, fair, and engaging without frustration or long delays. |
| **II. Extensible Games Platform** | **PASS** | Implemented directly within the `BiblicalRouletteActor` and game component without modifying the core app shell. |
| **III. Multiplayer-First Design** | **PASS** | Backend-authoritative deadline (`turnDeadlineUtc`) guarantees perfect synchronization across all local and networked clients. |
| **IV. Reusable & Composable Architecture** | **PASS** | Reuses existing `session.timeLimitSeconds`, base `ModalComponent`, and `ButtonComponent`. |
| **V. Content–Logic Separation** | **PASS** | Turn timing and hint prices are configured in state/session, while messages reside in i18n JSON files. |
| **VI. Simplicity & Fast Onboarding** | **PASS** | 3-second auto-dismiss and hands-free turn advancement reduce manual clicking and keep gameplay moving. |
| **VII. Neobrutalist Visual Identity** | **PASS** | High-contrast top-right badge, bold borders, yellow urgency warning at $\le$10s, pulsing red alert at $\le$5s. |
| **VIII. Maintainability & Pragmatic Engineering** | **PASS** | Zero new dependencies; uses standard C# `CancellationTokenSource` and Angular `effect` / intervals. |

## Project Structure

### Documentation (this feature)

```text
specs/007-roulette-turn-timer/
├── spec.md              # Feature specification & clarifications
├── plan.md              # This implementation plan
├── research.md          # Technical decisions & design alternatives
├── data-model.md        # State entities and data flow
├── quickstart.md        # Runnable verification guide
├── contracts/           # API and SignalR payload definitions
│   └── roulette-timer-contract.md
├── checklists/
│   └── requirements.md  # Spec quality validation checklist
└── tasks.md             # Tasks decomposition (generated in next phase)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── Dynamo.Core/
│   │   └── Models/
│   │       └── BiblicalRouletteState.cs    # Add turnDeadlineUtc, isTurnTimerPaused, isFirstSpinOfTurn
│   ├── Dynamo.Application/
│   │   └── Actors/
│   │       └── BiblicalRouletteActor.cs     # Implement turn timeout loop, reset & pause logic, 5000-pt hint
│   └── Dynamo.Api/                          # Program.cs, SignalR Hubs
└── tests/
    └── Dynamo.Application.Tests/
        └── BiblicalRouletteActorTests.cs    # Unit tests for timer timeout, action resets, and 5000-pt hint

frontend/
├── src/
│   ├── app/
│   │   ├── features/games/biblical-roulette/
│   │   │   ├── biblical-roulette.component.ts # Timer badge, 3s auto-dismiss, wider modal, 5000 hint
│   │   │   └── phrase-board/phrase-board.component.ts # Hint locked badge
│   └── public/i18n/
│       ├── es.json                          # Spanish translations for timer & hint
│       └── en.json                          # English translations for timer & hint
```

**Structure Decision**: Standard Web application (Option 2) updating existing C# backend actor and Angular frontend game component with zero restructuring.

## Complexity Tracking

*No constitutional violations. All implementations use existing patterns and libraries.*
