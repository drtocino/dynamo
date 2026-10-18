# Research & Technical Decisions: Card Question & Answer Game

**Feature**: `specs/005-card-qa-game`  
**Date**: 2026-10-18  
**Constraints**:
1. **Zero New Libraries**: No new third-party libraries or dependencies installed. Rely exclusively on existing libraries (Angular 18.2, TypeScript 5.5, Tailwind CSS 3.4, RxJS 7.8, ASP.NET Core EF Core).
2. **Animation Architecture**: Use Tailwind CSS for transitions and layout if possible, complemented by scoped custom CSS for 3D card flip transformations (`preserve-3d`, `rotate-y-180`, `backface-visibility: hidden`).
3. **Component Reusability**: Maximum reuse of existing platform components (`ModalComponent`, `ButtonComponent`, `TranslatePipe`).
4. **Shared-Screen Architecture**: Host-facilitated local shared-screen presentation on a single display; no mobile player clients or WebSocket synchronization needed.

---

## 1. Zero New Dependencies Architecture

### Decision
Implement the entire Card Q&A game using only existing built-in technologies:
- **Frontend**: Angular 18 Signals (`signal`, `computed`), standard `HttpClient`, `ReactiveFormsModule`, and browser native `window.localStorage` and `Blob` / `FileReader` APIs for JSON export/import.
- **Styling**: Tailwind CSS 3.4 utility classes, extending with scoped SCSS/CSS strictly for 3D card rotation transforms.
- **Backend**: Existing ASP.NET Core 8 API and Entity Framework Core with SQLite/PostgreSQL, following the existing `Dynamo.Core` -> `Dynamo.Application` -> `Dynamo.Infrastructure` architecture.

### Rationale
- Completely adheres to the explicit user constraint.
- Zero bundle overhead, zero supply-chain risk, and 100% alignment with Dynamo's existing engineering stack.
- Angular 18 Signals provide sub-millisecond reactive state management for card flipping, question quotas, and score calculation.

### Alternatives Considered
- Installing third-party animation libraries like `@angular/animations`, `framer-motion`, or `lottie-web`: **Rejected** — unnecessary complexity and strictly violates the zero-library mandate.
- Installing third-party modal or UI component packages: **Rejected** — the project already possesses well-tested neobrutalist shared components.

---

## 2. Card 3D Flip & Expansion Animation Architecture

### Decision
Use Tailwind CSS for modal layout, backdrop blur (`backdrop-blur-md`, `bg-black/60`), positioning, sizing, and color styling. Implement the card 3D flip animation using clean, hardware-accelerated CSS 3D transforms in the component's scoped styles:

```scss
/* Perspective container */
.card-perspective {
  perspective: 1000px;
}

/* 3D Transform Object */
.card-flipper {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flipper.flipped {
  transform: rotateY(180deg);
}

/* Front & Back Faces */
.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}
```

### Rationale
- Tailwind CSS 3.4 does not include default classes for `transform-style: preserve-3d` and `backface-visibility: hidden` without 3rd-party plugins. Standard scoped CSS provides true 60fps hardware-accelerated 3D rotation in under 400ms (satisfying SC-002) with zero dependencies.
- For modal entrance and background blur, standard Tailwind utility classes (`fixed inset-0 flex items-center justify-center backdrop-blur-md transition-all duration-300`) deliver high-performance visual results.
- Card expansion seamlessly scales up the card to a readable stage size while maintaining the card's tactile aspect ratio.

### Alternatives Considered
- Simple opacity/visibility toggle without 3D rotation: **Rejected** — the user specification explicitly requires a tactile turning/flip animation for both revealing the question and revealing the answer.
- Tailwind 3D plugins: **Rejected** — requires adding external npm dependencies.

---

## 3. Component Reusability Strategy

### Decision
Reuse existing platform components without duplication:
1. **`ModalComponent` (`app-modal`)**: Reused for the Results Modal, Game Configuration Modal, and Custom Questions Manager Modal. Provides standard neobrutalist dialog containers, header titles, backdrops, and close triggers.
2. **`ButtonComponent` (`app-button`)**: Reused across all action controls: "Correct" (green neobrutalist button), "Incorrect" (coral/red button), "View Results", "Reset Board", "Export JSON", "Import JSON", and navigation buttons.
3. **`TranslatePipe` (`translate`)**: Reused for 100% of UI strings, badges, labels, and modal titles in Spanish (`es`) and English (`en`).
4. **`LanguageSelectorComponent`**: Inherited from the platform header for language switching.

### Rationale
- Adheres directly to Constitution Principle IV (Reusable & Composable Architecture) and Principle VII (Neobrutalist Visual Identity).
- Guarantees visual coherence, consistent button elevation and shadows (`shadow-[4px_4px_0px_#000]`), and consistent focus/keyboard navigation.

### Alternatives Considered
- Creating custom ad-hoc buttons or inline modal backdrops in the new game folder: **Rejected** — increases code duplication and risks visual divergence from Dynamo's design system.

---

## 4. Question Sourcing & Offline Resilience

### Decision
Implement a dual-source strategy in `CardQaService`:
1. **Database Sourcing (Default)**:
   - Queries `GET /api/games/card-qa/questions?language={lang}`.
   - Handled via EF Core in ASP.NET Core with pre-seeded Biblical questions in both Spanish and English.
   - **Offline Fallback**: If the API request fails (e.g. offline projector laptop, backend unreachable), `CardQaService` automatically catches the HTTP error and falls back to a bundled static TypeScript seed array (`card-qa-seeds.ts`) matching the active language, logging a friendly console message and displaying a non-intrusive offline badge.
2. **Custom Questions Sourcing**:
   - Stored in browser `window.localStorage` under key `dynamo_card_qa_custom_questions`.
   - Admin can author True/False, Multiple Choice, and Open Questions.
   - **JSON Portability**: Uses native `Blob` and `URL.createObjectURL` for downloading question packs as `.json`, and native `FileReader` with schema validation for importing `.json` files.

### Rationale
- Fulfills Constitution Principle I (Wholesome Environment) by guaranteeing ready-to-play Biblical content out of the box.
- Fulfills Constitution Principle V (Content-Logic Separation) by keeping trivia questions completely decoupled from game engine logic.
- Guarantees flawless offline performance during live youth church gatherings without internet dependency.

### Alternatives Considered
- Backend-only without offline fallback: **Rejected** — church gatherings frequently experience intermittent internet or local-only laptop setups; an offline fallback prevents presentation failure.
- Custom questions stored only on backend: **Rejected** — requires user accounts/authentication which contradicts Constitution Principle VI (Fast Onboarding).

---

## 5. Host-Driven Shared-Screen State Architecture

### Decision
Model game state using an Angular 18 Signal Store pattern inside `CardQaService`:
- `cards`: Signal array of `BoardCard` items (1 to N, each holding sequential number, card state, and assigned question).
- `activePlayerRound`: Signal tracking `{ playerName, questionQuota, currentCount, results: [] }`.
- `allPlayerResults`: Signal list of all completed question evaluations grouped by player.
- `selectedCard`: Signal pointing to the currently expanded card (or `null`).
- `gameConfig`: Signal holding `{ totalCardCount, questionsPerTurn, questionSource, language }`.

### State Operations:
- `startPlayerRound(name: string)`: Registers new player and starts their turn.
- `openCard(cardIndex: number)`: Expands card and flips to question face.
- `revealAnswer()`: Flips card to answer face.
- `evaluateAnswer(isCorrect: boolean)`: Records result for active player, increments round count, disables the card on the grid, and closes modal.
- `toggleEvaluation(resultId: string)`: Corrects accidental misclick directly in Results Modal, dynamically updating score totals.
- `resetBoard()`: Re-initializes cards and scores for a fresh game upon host request.

### Rationale
- Pure Signal reactivity eliminates manual change detection and async pipe boilerplate.
- Unidirectional data flow ensures the grid, card modal, and results modal remain perfectly synchronized with zero state tearing.
