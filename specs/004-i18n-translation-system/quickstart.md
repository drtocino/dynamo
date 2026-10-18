# Quickstart & Verification Guide: Internationalization & Translation System

**Feature**: `specs/004-i18n-translation-system`  
**Date**: 2026-10-18  

This guide provides step-by-step instructions to verify that the internationalization and translation system works end-to-end, adhering to all acceptance scenarios in [spec.md](file:///c:/projects/dinamo/dynamo/specs/004-i18n-translation-system/spec.md).

---

## Prerequisites

1. Frontend development server running:
   ```bash
   cd frontend
   npm start
   ```
2. Application accessible at `http://localhost:4200` (or configured dev port).
3. Browser with developer tools open (`F12`).

---

## Scenario 1: Default Spanish Experience (User Story 1 / SC-002)

1. Open a new Incognito / Private browser window (ensures no `localStorage` keys exist).
2. Navigate to `http://localhost:4200`.
3. **Verify**:
   - The Hub screen displays in Spanish:
     - Header / Title: "Plataforma de Juegos Dynamo" (or configured Spanish title).
     - Game catalog: Game card shows "Ruleta Bíblica" (not "Biblical Roulette") and Spanish description.
     - Action buttons: "Unirse a Sala", "Crear Sala", "Pantalla Compartida".
   - Open Developer Tools -> Application -> Local Storage:
     - `dynamo_language` is either empty or initialized to `"es"`.
   - No untranslated keys (e.g. `hub.title` or raw English text) are visible.

---

## Scenario 2: Switching Language to English (User Story 2 / SC-003)

1. On the Hub screen, locate the language selector in the top header.
2. Click the selector and select **English (EN / 🇺🇸)**.
3. **Verify**:
   - All Hub screen text immediately switches to English without any full page reload.
   - Game card shows "Biblical Roulette" and the English description.
   - Action buttons display: "Join Session", "Create Session", "Shared Screen".
   - Check `localStorage.getItem('dynamo_language')` — it is `"en"`.

---

## Scenario 3: Browser Session Persistence (User Story 3 / SC-004)

1. With the language set to English, refresh the page (`Ctrl + F5`) or close and reopen the browser tab.
2. **Verify**:
   - The application immediately boots in English.
   - No flash of Spanish text or raw keys occurs during bootstrap.
3. Open a second, independent browser (e.g., Edge vs Chrome, or an Incognito window):
   - **Verify**: The second browser starts in Spanish (default), demonstrating per-browser scoping.

---

## Scenario 4: End-to-End Navigation & Gameplay Translation Coverage (User Story 4 / SC-001)

1. While in English:
   - Click "Create Session" -> Verify Configure screen is in English ("Configure Session", "Select Game", "Rounds", "Start").
   - Click "Shared Screen Setup" -> Verify setup screen is in English ("Shared Screen Setup", "Add Player", "Start Match").
   - Add two players and start match.
   - Verify Active Match top bar is in English ("Round", "Score", "Exit").
   - Verify Biblical Roulette gameplay is in English ("Spin Wheel", "Buy Vowel", "Solve Phrase", letter buttons).
   - Click "Buy Vowel" -> Verify modal is in English ("Buy a Vowel", "Cost: 250 Pts").
2. Return to Hub, switch language to Spanish:
   - Repeat the path above:
   - Verify every screen is rendered in natural Spanish ("Configurar Sesión", "Modo Pantalla Compartida", "Girar Ruleta", "Comprar Vocal", "Resolver Frase").

---

## Scenario 5: Two-Tier Fallback Verification (FR-011)

1. Temporarily inspect a key that exists only in Spanish (or intentionally test with a missing English key).
2. In English mode:
   - The key should display its Spanish translation rather than a raw key code.
3. If a key is missing from both files:
   - The raw string key (e.g., `test.missingKey`) is displayed so developers can identify missing strings.
