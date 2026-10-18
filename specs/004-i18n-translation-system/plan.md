# Implementation Plan: Internationalization & Translation System

**Branch**: `004-i18n-translation-system` | **Date**: 2026-10-18 | **Spec**: [spec.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/spec.md)

**Input**: Feature specification from `specs/004-i18n-translation-system/spec.md` with explicit constraint: "No new library should be installed just the current installed libraries and dependencies".

---

## Summary

Build a zero-dependency, runtime internationalization (i18n) system for the Dynamo frontend using standard Angular 18 features (Signals, `HttpClient`, `Pipe`, `APP_INITIALIZER`) and browser `localStorage`. The system defaults to Spanish (`es`), supports English (`en`), loads translations asynchronously from structured JSON files (`frontend/public/i18n/{lang}.json`), implements a two-tier fallback (Active Language → Spanish → Raw Key), provides a neobrutalist language selector on the Hub header, and systematically replaces 100% of hardcoded strings across all existing views, modals, and gameplay components.

---

## Technical Context

**Language/Version**: TypeScript ~5.5.2, Angular ^18.2.0  
**Primary Dependencies**: None (strictly zero new libraries; uses built-in `@angular/core`, `@angular/common/http`, `rxjs`, and native Web Storage API)  
**Storage**: Client-side `window.localStorage` (key: `dynamo_language`)  
**Testing**: Scenario-based validation per [quickstart.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/quickstart.md) and Angular component compilation checks (`npm run build`)  
**Target Platform**: Evergreen desktop and mobile web browsers (Chrome, Edge, Firefox, Safari)  
**Project Type**: Frontend Single-Page Application (Angular 18 standalone components)  
**Performance Goals**: 
- Initial translation load during bootstrap < 1s (SC-002)
- In-memory translation switch < 50ms (SC-003)
- O(1) dictionary key lookup per pipe transform maintaining 60fps render loops  
**Constraints**: 
- No third-party packages installed (no `@ngx-translate`, `@angular/localize`, etc.)
- Spanish (`es`) is primary default for all new visits
- Language selector strictly placed on Hub header only (Clarification Q1)
- Two-tier fallback chain: active language -> default Spanish -> raw key (Clarification Q2)
- Game catalog metadata translated via frontend JSON files (Clarification Q3)  
**Scale/Scope**: 
- 2 supported languages (`es`, `en`)
- ~150-250 unique translation keys across 7 primary flows (Hub, Session Configure, Session Join, Session Lobby, Shared-Screen Setup, Active Match top bar, Biblical Roulette + sub-components & modals)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Evaluation | Status |
|-----------|------------|--------|
| **I. Wholesome & Safe Environment** | All translated strings in Spanish and English will be wholesome, respectful, and Christian-appropriate for youth group audiences. | **PASS** |
| **II. Extensible Games Platform** | Translation keys are namespaced (e.g. `game.biblicalRoulette.*`). Future games can supply additional keys without touching the core translation engine. | **PASS** |
| **III. Multiplayer-First Design** | Language preference is purely client-side per browser; players in the same game can play in Spanish or English independently without affecting synchronization or room state. | **PASS** |
| **IV. Reusable & Composable Architecture** | `TranslationService` and `TranslatePipe` are shared core utilities provided at root level and reusable across all existing and future components. | **PASS** |
| **V. Content–Logic Separation** | UI copy is completely removed from TypeScript/HTML and isolated into versioned JSON files in `frontend/public/i18n/`. | **PASS** |
| **VI. Simplicity & Fast Onboarding** | Spanish default requires zero clicks or setup; language selector is a clean one-click toggle in the hub header. | **PASS** |
| **VII. Neobrutalist Visual Identity** | Language selector component follows neobrutalist tokens (chunky borders, solid shadows, bold typography, vibrant accents). | **PASS** |
| **VIII. Maintainability & Pragmatic Engineering** | Zero new dependencies, no complex build plugins, clean vanilla Angular signals architecture. | **PASS** |

*Gate Result*: **ALL GATES PASS**. No constitutional violations or complexity justifications required.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-i18n-translation-system/
├── spec.md              # Feature specification & clarifications
├── plan.md              # This implementation plan
├── research.md          # Technical research & zero-dependency architecture decisions
├── data-model.md        # Entities, types, and translation key schema
├── quickstart.md        # Step-by-step verification and test scenarios
├── contracts/
│   ├── translation-service.contract.ts # TypeScript contract for TranslationService
│   └── translation-file.schema.json    # JSON schema for translation dictionaries
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code Changes (Frontend)

```text
frontend/
├── public/
│   └── i18n/
│       ├── es.json                           # Spanish translation dictionary (primary default)
│       └── en.json                           # English translation dictionary (secondary)
└── src/
    └── app/
        ├── app.config.ts                     # Register APP_INITIALIZER for TranslationService
        ├── core/
        │   ├── i18n/                         # Core translation infrastructure
        │   │   ├── translation.service.ts    # Service: Signals, HTTP fetch, localStorage, 2-tier fallback
        │   │   ├── translate.pipe.ts         # Standalone pipe for template interpolation
        │   │   ├── translation.types.ts      # LanguageCode, TranslationParams, LanguageOption
        │   │   └── index.ts                  # Public barrel exports
        │   └── layout/
        │       └── layout.component.ts       # Layout integration
        ├── features/
        │   ├── hub/
        │   │   ├── hub.component.ts          # Integrate language selector in header + translate catalog
        │   │   └── components/
        │   │       └── language-selector/    # Neobrutalist Hub header language switcher
        │   │           └── language-selector.component.ts
        │   ├── sessions/
        │   │   ├── configure/
        │   │   │   └── configure.component.ts # Replace hardcoded strings with translate pipe
        │   │   ├── join/
        │   │   │   └── join.component.ts      # Replace hardcoded strings with translate pipe
        │   │   ├── lobby/
        │   │   │   └── lobby.component.ts     # Replace hardcoded strings with translate pipe
        │   │   ├── shared-screen-setup/
        │   │   │   └── shared-screen-setup.component.ts # Replace hardcoded strings
        │   │   └── active-match/
        │   │       ├── active-match.component.ts        # Replace hardcoded strings
        │   │       └── turn-tracker.component.ts        # Replace hardcoded strings
        │   └── games/
        │       └── biblical-roulette/
        │           ├── biblical-roulette.component.ts   # Replace hardcoded strings & labels
        │           ├── phrase-board/
        │           │   └── phrase-board.component.ts    # Translate hints & labels
        │           ├── roulette-wheel/
        │           │   └── roulette-wheel.component.ts  # Localized wheel slice labels
        │           └── vowel-store-modal/
        │               └── vowel-store-modal.component.ts # Translate modal title, buttons, costs
        └── shared/
            └── components/
                ├── button/
                │   └── button.component.ts   # Support translated button labels
                └── modal/
                    └── modal.component.ts    # Support translated modal headers & buttons
```

**Structure Decision**: Web application frontend architecture. All translation services, pipes, and types reside in `core/i18n/` to maintain clean separation of concerns and universal availability. Translation asset files are placed in `public/i18n/` to be served as static assets by Angular 18's application builder.

---

## Complexity Tracking

> *No Constitution violations. Table empty.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *N/A* | *N/A* |
