# Tasks: Internationalization & Translation System

**Input**: Design documents from `specs/004-i18n-translation-system/`  
**Prerequisites**: [plan.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/plan.md), [spec.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/spec.md), [research.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/research.md), [data-model.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/data-model.md), [contracts/](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/contracts/), [quickstart.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/quickstart.md)  
**Tests**: OPTIONAL (not explicitly requested in spec; validation executed via quickstart.md and build checks)  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  
**Constraint**: Zero new libraries/dependencies installed (Angular 18, RxJS 7.8, Web Storage API only).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create project directory structure, base translation files, and type definitions.

- [ ] T001 Create directory structure for translation assets in `frontend/public/i18n/` and core service module in `frontend/src/app/core/i18n/`
- [ ] T002 [P] Define core types, interfaces, and constants (`LanguageCode`, `LanguageOption`, `TranslationParams`, `DEFAULT_LANGUAGE`) in `frontend/src/app/core/i18n/translation.types.ts`
- [ ] T003 [P] Create initial base JSON files with shared common keys in `frontend/public/i18n/es.json` and `frontend/public/i18n/en.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core translation engine that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Implement `TranslationService` in `frontend/src/app/core/i18n/translation.service.ts` managing reactive Signals (`currentLang`, `translations`, `fallbackTranslations`, `isLoaded`), `HttpClient` asset fetching, two-tier fallback resolution, token interpolation, and safe `localStorage` access
- [ ] T005 [P] Implement standalone `TranslatePipe` in `frontend/src/app/core/i18n/translate.pipe.ts` with `pure: false` for instant change reactivity on language switch
- [ ] T006 [P] Create public module barrel exports in `frontend/src/app/core/i18n/index.ts`
- [ ] T007 Register `APP_INITIALIZER` provider in `frontend/src/app/app.config.ts` to pre-load default Spanish translations during Angular bootstrap

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Default Spanish Experience (Priority: P1) 🎯 MVP

**Goal**: Deliver a completely Spanish interface out of the box on first visit with zero configuration required.

**Independent Test**: Clear browser `localStorage` (or open fresh incognito window), navigate to `http://localhost:4200`, and verify all visible strings across all screens and components render in Spanish.

- [ ] T008 [US1] Author comprehensive Spanish translation dictionary covering all features (`common.*`, `hub.*`, `configure.*`, `join.*`, `lobby.*`, `sharedScreenSetup.*`, `activeMatch.*`, `game.biblicalRoulette.*`) in `frontend/public/i18n/es.json`
- [ ] T009 [P] [US1] Replace hardcoded strings in Hub view with `TranslatePipe` and localize game catalog metadata in `frontend/src/app/features/hub/hub.component.ts`
- [ ] T010 [P] [US1] Replace hardcoded strings in Session Configure view with `TranslatePipe` in `frontend/src/app/features/sessions/configure/configure.component.ts`
- [ ] T011 [P] [US1] Replace hardcoded strings in Session Join view with `TranslatePipe` in `frontend/src/app/features/sessions/join/join.component.ts`
- [ ] T012 [P] [US1] Replace hardcoded strings in Session Lobby view with `TranslatePipe` in `frontend/src/app/features/sessions/lobby/lobby.component.ts`
- [ ] T013 [P] [US1] Replace hardcoded strings in Shared Screen Setup view with `TranslatePipe` in `frontend/src/app/features/sessions/shared-screen-setup/shared-screen-setup.component.ts`
- [ ] T014 [P] [US1] Replace hardcoded strings in Active Match shell and Turn Tracker with `TranslatePipe` in `frontend/src/app/features/sessions/active-match/active-match.component.ts` and `frontend/src/app/features/sessions/active-match/turn-tracker.component.ts`
- [ ] T015 [US1] Replace hardcoded strings in Biblical Roulette gameplay, phrase board, roulette wheel, vowel store modal, and win/log modals with `TranslatePipe` across `frontend/src/app/features/games/biblical-roulette/biblical-roulette.component.ts`, `frontend/src/app/features/games/biblical-roulette/phrase-board/phrase-board.component.ts`, `frontend/src/app/features/games/biblical-roulette/roulette-wheel/roulette-wheel.component.ts`, and `frontend/src/app/features/games/biblical-roulette/vowel-store-modal/vowel-store-modal.component.ts`

**Checkpoint**: User Story 1 is functional as an MVP — entire app defaults to Spanish on initial visit.

---

## Phase 4: User Story 2 - Language Switching to English (Priority: P1)

**Goal**: Allow users to switch the app to English from the Hub header and have all visible text update immediately without a page reload.

**Independent Test**: On the Hub screen, click the language selector, select English, and verify all UI text immediately updates to English. Click Spanish, and verify it immediately updates back to Spanish.

- [ ] T016 [US2] Author comprehensive English translation dictionary matching 100% of keys in `frontend/public/i18n/en.json`
- [ ] T017 [US2] Implement Neobrutalist `LanguageSelectorComponent` with chunky borders, bold typography, and flag indicators in `frontend/src/app/features/hub/components/language-selector/language-selector.component.ts`
- [ ] T018 [US2] Integrate `LanguageSelectorComponent` into the header of `frontend/src/app/features/hub/hub.component.ts`
- [ ] T019 [US2] Verify instant reactive switching between Spanish and English without full page reload across all active views

**Checkpoint**: User Stories 1 AND 2 are fully functional — app starts in Spanish, switches smoothly to English and back.

---

## Phase 5: User Story 3 - Language Preference Persistence (Priority: P2)

**Goal**: Remember the user's language selection per browser using `localStorage`, gracefully defaulting to Spanish on fresh visits or restricted environments.

**Independent Test**: Switch language to English, reload or restart the browser, and confirm the app remains in English. Open a separate browser or incognito window and confirm it defaults to Spanish.

- [ ] T020 [US3] Implement persistent language saving and hydration with safe error handling in `frontend/src/app/core/i18n/translation.service.ts`
- [ ] T021 [US3] Verify per-browser scoping and storage recovery (clearing `localStorage` resets to Spanish default without errors)

**Checkpoint**: User Stories 1, 2, AND 3 work together — user preference persists across sessions and is isolated per browser.

---

## Phase 6: User Story 4 - Translation Coverage, Fallback & Interpolation (Priority: P1)

**Goal**: Ensure zero hardcoded strings remain, support dynamic parameter tokens, and guarantee two-tier fallback resilience.

**Independent Test**: Audit all screens with dynamic placeholders (e.g. player count in lobby, round numbers in match) and verify dynamic parameters are correctly interpolated. Test missing English key and verify Spanish fallback renders.

- [ ] T022 [US4] Update shared components (`frontend/src/app/shared/components/button/button.component.ts` and `frontend/src/app/shared/components/modal/modal.component.ts`) to ensure clean support for translated content and labels
- [ ] T023 [US4] Implement and verify parameterized token replacement (`{{count}}`, `{{name}}`, `{{pts}}`) in `TranslationService` and test in lobby, shared-screen setup, and active match top bar
- [ ] T024 [US4] Verify two-tier fallback resolution chain in `frontend/src/app/core/i18n/translation.service.ts` (Active Language → Spanish Default → Raw Key)

**Checkpoint**: All 4 user stories are fully implemented, verified, and integrated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality assurance, code cleanup, strict build checks, and end-to-end verification.

- [ ] T025 [P] Audit all HTML templates and TypeScript files in `frontend/src/app/` for any leftover hardcoded text strings
- [ ] T026 [P] Verify key parity between `frontend/public/i18n/es.json` and `frontend/public/i18n/en.json` to guarantee no missing keys exist in either dictionary
- [ ] T027 Run Angular production compilation check (`npm run build`) in `frontend` to verify strict template type checking and absence of syntax errors
- [ ] T028 Execute full end-to-end scenario verification following all 5 test scenarios in `specs/004-i18n-translation-system/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — delivers MVP
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) completion (needs Spanish keys and views in place to build selector and English mapping)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) completion
- **User Story 4 (Phase 6)**: Depends on User Stories 1, 2, and 3 completion
- **Polish (Phase 7)**: Depends on all user stories being completed

### Within Each User Story

- Types/Models before services
- Services before UI components
- Base translations before template integration
- Story checkpoint validated before moving to next priority

### Parallel Opportunities

- In Phase 1: `T002` and `T003` can execute in parallel
- In Phase 2: `T005` and `T006` can execute in parallel while `T004` is completed
- In Phase 3: `T009`, `T010`, `T011`, `T012`, `T013`, and `T014` can execute in parallel across independent view components
- In Phase 7: `T025` and `T026` can run in parallel

---

## Parallel Example: User Story 1 Views Migration

```bash
# Launch independent component template migrations in parallel:
Task: T009 Replace hardcoded strings in Hub view with TranslatePipe in frontend/src/app/features/hub/hub.component.ts
Task: T010 Replace hardcoded strings in Session Configure view with TranslatePipe in frontend/src/app/features/sessions/configure/configure.component.ts
Task: T011 Replace hardcoded strings in Session Join view with TranslatePipe in frontend/src/app/features/sessions/join/join.component.ts
Task: T012 Replace hardcoded strings in Session Lobby view with TranslatePipe in frontend/src/app/features/sessions/lobby/lobby.component.ts
Task: T013 Replace hardcoded strings in Shared Screen Setup view with TranslatePipe in frontend/src/app/features/sessions/shared-screen-setup/shared-screen-setup.component.ts
Task: T014 Replace hardcoded strings in Active Match shell and Turn Tracker in frontend/src/app/features/sessions/active-match/
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (directories, base files, types)
2. Complete Phase 2: Foundational (TranslationService, TranslatePipe, APP_INITIALIZER)
3. Complete Phase 3: User Story 1 (Spanish dictionary, template migrations across all views)
4. **STOP and VALIDATE**: Verify entire app starts up and runs 100% in Spanish with no user intervention required
5. MVP achieved!

### Incremental Delivery

1. **Increment 1**: Foundation + User Story 1 → Default Spanish application (MVP)
2. **Increment 2**: User Story 2 → English translation dictionary + Neobrutalist language selector in Hub header
3. **Increment 3**: User Story 3 → `localStorage` persistence and fallback resilience per browser
4. **Increment 4**: User Story 4 → Full parameter interpolation, shared components, and two-tier fallback verification
5. **Increment 5**: Phase 7 Polish → Key parity audit, zero hardcoded string verification, `npm run build`
