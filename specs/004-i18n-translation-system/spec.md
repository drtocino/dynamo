# Feature Specification: Internationalization & Translation System

**Feature Branch**: `004-i18n-translation-system`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "The main language for this app should be Spanish, so English is just the secondary one so the default should also be in Spanish. All the strings on the app should be translated and have a proper translation system that bases on a json file that replaces the keys of the strings by the value on the json file corresponding to that keys. The language configured for the current session should be stored on local storage so the custom language is set only for the current browser. The translations should have a separate json for each language."

## Clarifications

### Session 2026-10-18

- Q: Where should the language selector be placed in the UI? → A: Hub screen only — a compact flag/dropdown in the hub header, set before entering any session.
- Q: Should the system try the default language before falling back to the raw translation key? → A: Yes, two-tier fallback — try Spanish first, then show the raw key only if both files are missing the key.
- Q: Should game catalog metadata (names, descriptions) come from translation files or from the backend? → A: Translation files — game names and descriptions are translated via the frontend JSON files, ensuring the hub game catalog is fully localized.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User sees the entire application in Spanish by default (Priority: P1)

A user opens the Dynamo application for the first time. Without any configuration or interaction, the entire interface — hub, session setup, lobby, active match, game UI, modals, buttons, labels, and all visible text — is displayed in Spanish.

**Why this priority**: Spanish is the primary language of the platform's target audience. The default experience must be fully in Spanish from the first visit with zero configuration required.

**Independent Test**: Can be fully tested by opening the application in a fresh browser (no local storage data) and verifying every visible string is rendered in Spanish across all screens: hub, game catalog, session configuration, lobby, active match top bar, Biblical Roulette gameplay (phrase board labels, roulette labels, vowel store modal, win/loss modals, log modal), and all shared components (buttons, modals, turn tracker).

**Acceptance Scenarios**:

1. **Given** a new user opens the application for the first time, **When** the hub screen loads, **Then** all text — page titles, game descriptions, buttons, badges, labels — is displayed in Spanish.
2. **Given** a user navigates through the session setup flow (configure → lobby → active match), **When** each screen renders, **Then** all UI strings are in Spanish.
3. **Given** a user is playing Biblical Roulette, **When** they see the game controls, modals (vowel store, win modal, log modal), roulette labels, and score displays, **Then** all static UI strings are in Spanish.
4. **Given** dynamic content from the backend (e.g., phrase hints, verse text), **When** the content is displayed, **Then** backend-provided gameplay content is shown as-is, while all surrounding UI labels and game catalog metadata (names, descriptions) are translated.

---

### User Story 2 - User switches the application language to English (Priority: P1)

A user who prefers English can switch the application language. After switching, all UI text updates to English. The preference is remembered across browser sessions.

**Why this priority**: English is the secondary supported language. Users must be able to switch to it and have that choice persist, ensuring the app is usable for non-Spanish-speaking participants.

**Independent Test**: Can be tested by opening the language selector, choosing English, verifying all visible strings change to English, closing the browser, reopening the application, and confirming English is still active.

**Acceptance Scenarios**:

1. **Given** the application is displayed in Spanish, **When** the user opens the language selector and chooses English, **Then** all UI text immediately updates to English without a page reload.
2. **Given** the user has switched to English, **When** they close and reopen the browser, **Then** the application loads in English.
3. **Given** the user is in English mode, **When** they navigate to any screen (hub, lobby, active match, game screens), **Then** all UI strings are in English.
4. **Given** the user has switched to English, **When** they open the language selector and choose Spanish, **Then** all UI text immediately updates back to Spanish.

---

### User Story 3 - Language preference persists per browser (Priority: P2)

The language preference is scoped to the individual browser using local storage. Different browsers or devices can independently use different languages.

**Why this priority**: Supports shared-device scenarios common in youth group settings where different leaders or groups may prefer different languages.

**Independent Test**: Can be tested by setting English on Browser A, opening Browser B (or an incognito window), and verifying Browser B defaults to Spanish while Browser A remains in English.

**Acceptance Scenarios**:

1. **Given** a user sets the language to English on Browser A, **When** they open the application on Browser B (or incognito), **Then** Browser B defaults to Spanish (the platform default).
2. **Given** a user clears their browser's local storage, **When** they reload the application, **Then** it reverts to Spanish.

---

### User Story 4 - All existing screens and components display translated strings (Priority: P1)

Every hardcoded string across all existing screens and components is replaced with translation keys that resolve to the appropriate language. No English or Spanish text is hardcoded in the component templates.

**Why this priority**: Without full coverage, the translation system is incomplete and the user experience is broken — a mix of languages is confusing and unprofessional.

**Independent Test**: Can be tested by switching between Spanish and English and verifying that every single visible string changes appropriately across all screens. A comprehensive visual audit identifies any untranslated remnants.

**Acceptance Scenarios**:

1. **Given** the application is in Spanish, **When** the user switches to English, **Then** no Spanish text remains visible anywhere in the application (excluding dynamic backend content like game phrases/verses).
2. **Given** the application is in English, **When** the user switches to Spanish, **Then** no English text remains visible anywhere in the application (excluding dynamic backend content).
3. **Given** a developer adds a new UI string, **When** they follow the translation workflow, **Then** they add the key to both JSON translation files and use the key in the template.

---

### Edge Cases

- What happens when a translation key is missing from a language file? The system first attempts to resolve the key from the default language (Spanish). If the key is also missing from the default language file, the system displays the raw key itself as a fallback so missing translations are visually obvious during development and testing.
- What happens when local storage is disabled or unavailable? The system gracefully falls back to the default language (Spanish) without errors.
- What happens when a new language file is malformed or fails to load? The system falls back to the default language (Spanish) and logs a warning to the console.
- How does the system handle strings that contain dynamic interpolation (player names, scores, counts)? Translation strings support parameterized placeholders (e.g., `{{playerName}}`) that are replaced at render time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST default to Spanish as the primary language when no language preference is stored.
- **FR-002**: The system MUST support English as a secondary language.
- **FR-003**: The system MUST store the user's language preference in the browser's local storage.
- **FR-004**: The system MUST load translations from a separate JSON file for each supported language (e.g., one file for Spanish, one file for English).
- **FR-005**: All user-facing strings in the application MUST be referenced by translation keys, not hardcoded text.
- **FR-006**: The system MUST resolve translation keys to the corresponding values in the active language's JSON file at render time.
- **FR-007**: The system MUST support parameterized translation strings with dynamic value interpolation (e.g., player names, scores, round numbers).
- **FR-008**: The system MUST update all visible strings immediately when the user changes the language, without requiring a page reload.
- **FR-009**: The system MUST provide a language selector as a compact flag or dropdown in the hub screen header, allowing users to switch languages before entering a session.
- **FR-010**: The system MUST fall back to the default language (Spanish) if local storage is unavailable or the stored preference is invalid.
- **FR-011**: When a translation key is missing from the active language file, the system MUST first attempt to resolve it from the default language (Spanish). If the key is also missing from the default language file, the system MUST fall back to displaying the raw translation key.
- **FR-012**: The system MUST NOT translate dynamic gameplay content provided by the backend (e.g., game phrases, verse text, player names) — only static UI strings are translated.
- **FR-013**: Game catalog metadata (game names and descriptions displayed in the hub) MUST be translated via the frontend translation JSON files, not sourced untranslated from the backend.

### Key Entities

- **Translation File**: A JSON file containing key-value pairs where keys are translation identifiers and values are the translated strings for a specific language. One file per supported language.
- **Language Preference**: The user's selected language identifier (e.g., `es`, `en`) stored in the browser's local storage.
- **Translation Key**: A structured string identifier used in templates to reference translatable text (e.g., `hub.title`, `game.roulette.spinButton`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-facing static strings across all screens are translated — zero hardcoded text remains in component templates.
- **SC-002**: The application defaults to Spanish on first visit in under 1 second with no user interaction required.
- **SC-003**: Switching languages updates all visible text in under 500 milliseconds without a page reload.
- **SC-004**: Language preference persists across browser sessions — reopening the browser restores the last selected language 100% of the time.
- **SC-005**: Adding a new translatable string requires only adding the key-value pair to each language JSON file and using the key in the template — no changes to translation infrastructure.
- **SC-006**: Both Spanish and English translations are complete and accurate for all existing screens: hub, session configuration, lobby, shared-screen setup, active match, Biblical Roulette (including all sub-components and modals).

## Assumptions

- The application currently has all UI strings hardcoded in English within Angular component templates. These will be systematically replaced with translation keys.
- Only two languages are supported initially: Spanish (primary/default) and English (secondary). The architecture should make adding future languages straightforward (add a new JSON file), but no more than these two are required for this feature.
- Dynamic gameplay content from the backend (game phrases, biblical verses, player-entered names) is NOT translated by this system — it is displayed as-is from the server. However, game catalog metadata (names, descriptions) IS translated via frontend translation files.
- The translation system operates entirely on the frontend. No backend changes are required for translation of UI strings.
- The language selector is placed exclusively in the hub screen header as a compact flag or dropdown. It is not shown during active gameplay to avoid disruption. Users set their language preference before entering a session.
- Translation key naming will follow a hierarchical dot-notation convention organized by feature/screen (e.g., `hub.welcomeTitle`, `lobby.roomCode`, `game.biblicalRoulette.spinButton`).
