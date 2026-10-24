# Research & Technical Decisions: Roulette Turn Timer, Spin Result Polish, and Hint Cost Adjustment

**Feature**: `specs/007-roulette-turn-timer`  
**Date**: 2026-10-24  
**Constraints**:
1. **Zero New Libraries**: Rely exclusively on existing project technologies (.NET 8 C# 12, Angular 18.2, TypeScript 5.5, RxJS 7.8, Tailwind CSS 3.4).
2. **Preserve Flow Functionality**: Existing roulette gameplay, consonants picking, vowel purchasing, phrase masking, and scoring rules must remain intact.
3. **Backend-Authoritative Timing**: Multiplayer and shared-screen state must remain fully synchronized without clock drift issues.

---

## 1. Turn Timer Architecture & Synchronization

### Decision
Implement an authoritative backend turn deadline combined with client-side reactive rendering:
1. **Backend Actor (`BiblicalRouletteActor.cs`)**:
   - Manages `_turnTimerCts` (`CancellationTokenSource`).
   - When a player's turn begins:
     - Reads `session.TimeLimitSeconds` (defaults to 60s if $\le 0$).
     - If it is the first action of the turn (`_isFirstSpinOfTurn = true`), adds **15 seconds** (e.g. 75s).
     - Sets `_rouletteState.TurnDeadlineUtc = DateTime.UtcNow.AddSeconds(turnDuration);`
     - Sets `_rouletteState.IsTurnTimerPaused = false;`
     - Starts an asynchronous background task `MonitorTurnTimeoutAsync(_turnTimerCts.Token, turnDuration)` that waits for the duration. If not cancelled by a valid action, it invokes `AdvanceToNextTurn()` and broadcasts state.
2. **Frontend Component (`biblical-roulette.component.ts`)**:
   - Receives `turnDeadlineUtc` and `isTurnTimerPaused` in `rouletteState()`.
   - Computes remaining seconds reactively: `Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000))`.
   - Uses an internal 1-second interval to decrement the display smoothly while keeping it locked to the server timestamp.

### Rationale
- Completely avoids client clock tampering or background tab throttling desynchronizing game flow.
- Because all clients share the exact same `turnDeadlineUtc` timestamp, spectator screens, host displays, and remote player devices show identical countdowns.

### Alternatives Considered
- **Pure Client Timer with `TURN_TIMEOUT` Intent**: Vulnerable to client sleep/throttling when a player minimizes their browser or lags, freezing the game for others. **Rejected.**
- **Periodic SignalR Tick per Second from Server**: Saturates WebSocket connections with unnecessary network traffic. **Rejected in favor of single deadline timestamp + client interpolation.**

---

## 2. Timer Reset & Pausing Mechanisms

### Decision
1. **Reset Triggers**:
   - Executing `SPIN_ROULETTE`, `PURCHASE_VOWEL`, or `PURCHASE_HINT` cancels the active `_turnTimerCts`.
   - If the player retains turn authority (e.g. found consonants or vowels), a new timer begins immediately using the **standard duration** (`timeLimitSeconds`), clearing the first-action bonus (`_isFirstSpinOfTurn = false`).
2. **Pause Triggers**:
   - **Wheel Spinning**: The timer pauses while the wheel rotates (`isWheelSpinning = true`).
   - **Solve Verse Modal**: The timer pauses while `isSolveModalOpen = true`. To prevent unfair stalling, canceling the modal without guessing resumes from the remaining paused seconds rather than providing a fresh timer.
   - **Spin Result Modal**: The timer pauses while `isSpinResultModalOpen = true`.
3. **Resume Behavior**:
   - Once the modal closes or wheel finishes spinning, if the turn is retained, the countdown resumes with the fresh standard duration.

### Rationale
- Players are never penalized while waiting for physical/visual wheel animations to finish or while typing a long biblical phrase guess.
- Resumes cleanly without timing exploits.

---

## 3. Redesigned Spin Result Modal

### Decision
1. **Auto-Dismissal in 3 Seconds**:
   - When the modal opens, a 3-second timer (`setTimeout(..., 3000)`) is started.
   - When the 3 seconds elapse, `closeSpinResultModal()` is called automatically.
   - If the user manually clicks "Continuar", the timeout is cleared and the modal closes immediately.
2. **Wider Geometry & Visual Hierarchy**:
   - Modal container utilizes `max-w-xl sm:max-w-2xl` for a more expansive, cinematic feel on desktop and projected screens.
   - The outcome wedge (e.g. `500 PTS`, `QUIEBRA`, `PIERDE TURNO`) and letter count are scaled up (`text-3xl sm:text-4xl`).
3. **Inline Points Display**:
   - Replaces the nested card container with clean, bold inline text (e.g., `+100` or `+500 pts`) alongside the result details.

### Rationale
- Maximizes energy and legibility for church youth groups watching on a large display.
- Keeps game pacing brisk by eliminating mandatory button clicking after every spin.

---

## 4. Specific Hint Cost Adjustment (5,000 Points)

### Decision
1. Update backend validation in `BiblicalRouletteActor.cs`:
   ```csharp
   if (turnPlayer.Score < 5000) return;
   turnPlayer.Score -= 5000;
   ```
2. Update frontend threshold in `biblical-roulette.component.ts`:
   - Button disabled if `currentTurnPlayerScore() < 5000`.
   - Modal displays `5,000 pts`.
3. Update phrase board badge in `phrase-board.component.ts` and i18n JSON files (`es.json`, `en.json`) to reflect `5,000 pts`.

### Rationale
- 5,000 points strikes the ideal strategic balance: achievable within 2–3 successful spins while requiring meaningful scoring dedication.
