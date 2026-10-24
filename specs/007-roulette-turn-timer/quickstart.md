# Quickstart & Validation Guide: Roulette Turn Timer & Polish

**Feature**: `specs/007-roulette-turn-timer`  
**Date**: 2026-10-24  

This guide provides step-by-step procedures to validate all capabilities delivered by this feature.

---

## Prerequisites

1. **Backend**: ASP.NET Core API running at `http://localhost:5000` (or `https://localhost:5001`).
2. **Frontend**: Angular dev server running at `http://localhost:4200`.
3. Reference documentation:
   - Specification: [spec.md](spec.md)
   - Data Model: [data-model.md](data-model.md)
   - Interface Contracts: [contracts/roulette-timer-contract.md](contracts/roulette-timer-contract.md)

---

## Automated Validation

Run backend xUnit unit tests verifying turn timeout loops, action resets, and 5,000-point hint deductions:

```bash
dotnet test backend/tests/Dynamo.Application.Tests
```

**Expected Outcome**: All tests pass (`Passed: >= 27, Failed: 0`).

---

## Manual End-to-End Scenarios

### Scenario 1: Initial Turn Countdown with 15-Second Grace Bonus
1. Create a session configuring a 30-second turn limit (`timeLimitSeconds = 30`).
2. Start the Biblical Roulette match.
3. Observe the top-right header adjacent to the turn score.
4. **Validation Check**:
   - The timer badge renders with **45 seconds** ($30\text{s} + 15\text{s}$).
   - The timer counts down smoothly: $45 \rightarrow 44 \rightarrow \dots$.

---

### Scenario 2: Color-Coded Urgency Alerts
1. Allow the timer to count down below 11 seconds.
2. **Validation Check**:
   - At $\le 10$ seconds, the timer badge turns **yellow** (`bg-neo-yellow text-neo-black`).
   - At $\le 5$ seconds, the timer badge turns **red** with a pulse animation (`bg-red-500 text-white animate-pulse`).

---

### Scenario 3: Automatic Turn Timeout on Zero
1. Allow the countdown to reach 0 seconds without taking any action.
2. **Validation Check**:
   - Turn authority automatically transfers to the next player.
   - The newly active player's name is underlined.
   - A fresh countdown begins for the new player with the 45-second first-spin bonus.

---

### Scenario 4: Timer Reset on Qualifying Action
1. As the active player, select a consonant and spin the roulette.
2. If letters are found, the player retains their turn.
3. **Validation Check**:
   - The countdown resets to the **standard 30 seconds** (the +15s bonus is not repeated for subsequent spins in the same turn).

---

### Scenario 5: Timer Paused During Modals and Wheel Spinning
1. While counting down, click "🎯 Resolver" (Solve Verse).
2. **Validation Check**:
   - The timer stops decrementing while the modal is open.
3. Close the modal by clicking "Cancelar".
4. **Validation Check**:
   - The timer resumes counting from its exact paused value.

---

### Scenario 6: Streamlined Spin Result Modal (3-Second Auto-Dismiss & Plain Text Points)
1. Select a consonant and spin the wheel.
2. **Validation Check**:
   - The Spin Result modal opens with an expansive, wide layout.
   - Letters found and wedge amount are prominently displayed.
   - Points earned appear directly as clean inline text (e.g., `+300 pts`).
   - After exactly 3 seconds, the modal automatically disappears without requiring a click.
   - Alternatively, clicking "Continuar" closes the modal immediately.

---

### Scenario 7: Specific Hint Cost (5,000 Points)
1. Ensure the active player has fewer than 5,000 points.
2. Verify the "💡 Pista" button is disabled.
3. Once the player has $\ge 5,000$ points, click "💡 Pista".
4. **Validation Check**:
   - The confirmation modal states a cost of **5,000 puntos**.
   - Upon confirming, exactly 5,000 points are deducted.
   - The phrase board badge and log update to 5,000 points.
