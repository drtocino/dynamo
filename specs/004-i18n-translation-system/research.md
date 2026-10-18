# Research & Technical Decisions: Internationalization & Translation System

**Feature**: `specs/004-i18n-translation-system`  
**Date**: 2026-10-18  
**Constraint**: No new library should be installed; use only currently installed libraries and dependencies (Angular 18.2, RxJS 7.8, native Browser APIs).

---

## 1. Zero-Dependency Translation Engine Architecture

### Decision
Implement a custom, lightweight translation engine composed of:
1. `TranslationService`: A root-provided Angular service managing active language state via Angular Signals (`signal`, `computed`), caching translation dictionaries, handling HTTP retrieval via `HttpClient`, persisting preference in `localStorage`, and implementing the two-tier fallback resolution.
2. `TranslatePipe`: A standalone Angular pipe (`pure: false` or signal-reactive) for seamless template syntax: `{{ 'hub.title' | translate }}` and parameterized syntax: `{{ 'lobby.playerCount' | translate:{ count: players.length } }}`.
3. `APP_INITIALIZER` provider: Pre-loads the selected language (or Spanish default) during Angular bootstrap so the initial screen renders fully translated with zero flash of untranslated keys.

### Rationale
- **Zero Third-Party Dependencies**: Satisfies the explicit requirement with zero bundle bloat and zero vulnerability footprint.
- **Angular 18 Native Idioms**: Angular Signals provide fine-grained reactivity. When the language signal updates, any consumer reading it immediately recomputes without requiring full page reloads or zone-wide teardowns.
- **Lightweight & High Performance**: An in-memory key-value dictionary lookup takes < 1 ms. Parsing a JSON dictionary under 50KB has negligible overhead.

### Alternatives Considered
- **`@ngx-translate/core`**: Rejected due to explicit user constraint against installing new dependencies.
- **Angular `@angular/localize`**: Angular's native i18n requires compile-time builds per locale or separate deployment bundles, which prevents runtime in-browser instant switching and does not store preferences in `localStorage` dynamically.
- **Hardcoded In-Code Dictionaries**: Embedding large translation dictionaries in TypeScript files violates Constitution Principle V (Content–Logic Separation). Storing JSON files in `public/i18n/` allows independent editing and loading.

---

## 2. Asset Storage & Static Serving in Angular 18 Application Builder

### Decision
Store language files in `frontend/public/i18n/es.json` and `frontend/public/i18n/en.json`.

### Rationale
- In `frontend/angular.json`, the `@angular-devkit/build-angular:application` builder is configured with:
  ```json
  "assets": [
    {
      "glob": "**/*",
      "input": "public"
    }
  ]
  ```
- Any file in `frontend/public/i18n/` is served directly at the root path `/i18n/{lang}.json` in both `ng serve` and production builds.
- Clean separation between code and translation content according to Constitution Principle V.

### Alternatives Considered
- `src/assets/i18n/`: Would require modifying `angular.json` asset mappings because the project currently points to `public`. Using `public/i18n/` aligns with the existing project configuration.

---

## 3. Two-Tier Fallback & Resolution Chain

### Decision
Implement the two-tier fallback chain clarified in Q2:
1. **Tier 1 (Active Language)**: Check `translations[activeLang][key]`. If present and non-empty, return it.
2. **Tier 2 (Default Language - Spanish)**: If missing in active language (e.g. English), check `translations['es'][key]`. If present, return the Spanish string and optionally log a debug warning.
3. **Tier 3 (Raw Key Fallback)**: If key is missing in both files, return the raw key string (e.g., `'common.unknownKey'`) so missing keys are immediately visible to developers.

### Rationale
- Guarantees youth group players always see meaningful text rather than cryptic error codes or raw keys if an English translation string was omitted.
- Meets Clarification Q2 and Functional Requirement FR-011.

---

## 4. Parameter Interpolation Engine

### Decision
Use a lightweight token interpolation function:
```typescript
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, token) => {
    return params[token] !== undefined ? String(params[token]) : `{{${token}}}`;
  });
}
```

### Rationale
- Extremely fast single-pass regex replacement.
- Familiar mustache syntax (`{{playerName}}`, `{{count}}`).
- Safely handles missing parameter values by leaving placeholder intact or displaying default.

---

## 5. Pipe Re-evaluation Strategy

### Decision
Create `TranslatePipe` as a standalone pipe with `pure: false` that injects `TranslationService`.
```typescript
@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private translationService = inject(TranslationService);

  transform(key: string, params?: Record<string, string | number>): string {
    return this.translationService.translate(key, params);
  }
}
```

### Rationale
- When `pure: false`, Angular evaluates the transform during change detection cycles. Because translation lookup is a direct dictionary map read (`O(1)`), performance impact is sub-millisecond.
- When the user changes language via the hub selector, `TranslationService` updates its internal state and triggers change detection, immediately updating all bound templates across the entire application without page reload (SC-003, FR-008).

### Alternatives Considered
- `pure: true` with an observable / signal pipe: Pure pipes only recalculate when their input argument (`key` or `params`) changes identity. To trigger recalculation on language change, one must pass `currentLang()` as an argument or wrap every string in an async pipe (`'hub.title' | translate | async`). Using `pure: false` gives a clean syntax `{{ 'hub.title' | translate }}` while maintaining high 60fps performance.

---

## 6. Language Persistence & Initialization

### Decision
- Storage Key: `dynamo_language` in `window.localStorage`.
- Default: `'es'`.
- Supported Languages: `'es'` (Spanish), `'en'` (English).
- Initialization:
  ```typescript
  export function initializeAppTranslations(translationService: TranslationService) {
    return () => translationService.initLanguage();
  }
  ```
  Registered in `app.config.ts` via `APP_INITIALIZER`:
  ```typescript
  {
    provide: APP_INITIALIZER,
    useFactory: initializeAppTranslations,
    deps: [TranslationService],
    multi: true
  }
  ```
- Error Resilience: If `localStorage` is blocked (security sandbox, private browsing edge cases), wrap access in `try/catch` and default safely to `'es'`.

---

## 7. Scope of Translation Coverage

### Existing Strings Identified Across Components:
1. **Hub** (`frontend/src/app/features/hub/hub.component.ts`):
   - Header, title ("Dynamo Games", "Youth Group Multiplayer Platform"), session join/create buttons, game catalog cards (names, descriptions, badges like "Featured", "Fast-paced Christian knowledge trivia challenge...").
2. **Session Configure** (`frontend/src/app/features/sessions/configure/configure.component.ts`):
   - Configuration title, game select, rounds selector, round timer selector, shared screen toggle, button labels ("Start Session", "Back to Hub").
3. **Session Join** (`frontend/src/app/features/sessions/join/join.component.ts`):
   - "Join Match", room code input placeholder, player name input, "Join Game" button, error alerts.
4. **Session Lobby** (`frontend/src/app/features/sessions/lobby/lobby.component.ts`):
   - Room code display, player count, "Waiting for players...", player list, player edit modal/actions, "Start Game", "Leave Lobby", copy code tooltip.
5. **Shared Screen Setup** (`frontend/src/app/features/sessions/shared-screen-setup/shared-screen-setup.component.ts`):
   - Setup title, subtitle, player input field, "Add Player", player list, edit name, remove, "Start Game" button, minimum player validation.
6. **Active Match Shell & Turn Tracker** (`frontend/src/app/features/sessions/active-match/`):
   - Top bar: Room code, Round X of Y, Exit Game, Scores, Turn tracker ("Current Turn", "Waiting for...").
7. **Biblical Roulette Gameplay** (`frontend/src/app/features/games/biblical-roulette/`):
   - Roulette wheel segments ("100 Pts", "Free Vowel", "Bankrupt", "Skip Turn", etc.).
   - Controls: "Spin Wheel", "Buy Vowel", "Solve Phrase", letter keyboard, timer display.
   - Modals: Vowel store modal ("Buy a Vowel - 250 Pts", vowel buttons, "Cancel"), Win/Loss modal ("Winner!", "Round Complete", "Final Scores", "Next Round", "Return to Hub"), Game Log modal ("Match Events", event messages).
8. **Shared UI Components** (`frontend/src/app/shared/components/`):
   - Common buttons ("Cancel", "Confirm", "Close", "Back", "Save", "Delete", "Edit").
