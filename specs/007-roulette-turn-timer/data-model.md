# Data Model: Roulette Turn Timer, Spin Result Polish, and Hint Cost Adjustment

**Feature**: `specs/007-roulette-turn-timer`  
**Date**: 2026-10-24  

---

## 1. Domain Entities & State Models

### 1.1 `BiblicalRouletteState` (C# Backend & TypeScript Frontend)

State model additions to synchronize the authoritative countdown timer across all clients:

```csharp
public class BiblicalRouletteState
{
    // ... Existing state fields (maskedPhrase, currentTurnPlayerId, playerNames, etc.) ...

    /// <summary>
    /// UTC timestamp indicating when the active player's turn will expire.
    /// Null if the turn timer is currently halted or game is not active.
    /// </summary>
    [JsonPropertyName("turnDeadlineUtc")]
    public DateTime? TurnDeadlineUtc { get; set; }

    /// <summary>
    /// Indicates whether countdown calculation is temporarily paused
    /// (e.g. while wheel is spinning, solve modal is open, or spin result is visible).
    /// </summary>
    [JsonPropertyName("isTurnTimerPaused")]
    public bool IsTurnTimerPaused { get; set; }

    /// <summary>
    /// True if the active player has not yet taken their first action this turn,
    /// triggering the +15 second grace period.
    /// </summary>
    [JsonPropertyName("isFirstSpinOfTurn")]
    public bool IsFirstSpinOfTurn { get; set; } = true;
}
```

Equivalent TypeScript interface definition:
```typescript
export interface BiblicalRouletteState {
  // ... Existing fields ...
  turnDeadlineUtc?: string | null;
  isTurnTimerPaused?: boolean;
  isFirstSpinOfTurn?: boolean;
}
```

---

## 2. Frontend Reactive Timer Model

### 2.1 `TurnTimerDisplay`

Reactive client-side view state driven by `turnDeadlineUtc`:

```typescript
export interface TurnTimerDisplay {
  secondsLeft: number;             // Ceiled remaining seconds (e.g. 75, 60, ... 0)
  urgencyLevel: 'normal' | 'warning' | 'critical';
  isPaused: boolean;
  badgeClass: string;              // Neobrutalist tailwind styling
}
```

#### Urgency Level Transitions:
| Seconds Left | Urgency Level | Visual Presentation |
|--------------|---------------|---------------------|
| $> 10$ s     | `'normal'`    | `bg-neo-black text-white border-2 border-neo-black` |
| $6 - 10$ s   | `'warning'`   | `bg-neo-yellow text-neo-black border-2 border-neo-black` |
| $\le 5$ s    | `'critical'`  | `bg-red-500 text-white border-2 border-neo-black animate-pulse` |

---

## 3. Spin Result Modal View Model

### 3.1 `SpinResultModalData`

```typescript
export interface SpinResultModalData {
  resultLabel: string;             // e.g. "500 PTS", "QUIEBRA", "PIERDE TURNO"
  prizeAmount: number;             // Numeric wedge value (e.g. 500)
  letter: string;                  // Active staged consonant (e.g. 'D')
  lettersCount: number;            // Count of occurrences found
  finalTurnScore: number;          // Total points awarded (prizeAmount * count)
  isBankrupt: boolean;
  isMissTurn: boolean;
}
```

#### Lifecycle State Transitions:
```text
[Wheel Spin Ends] 
       │
       ▼
[Open Modal: start 3000ms auto-dismiss timer] ──(User clicks "Continuar" early)──┐
       │                                                                         │
       ▼                                                                         │
(3000ms timer elapses)                                                           │
       │                                                                         ▼
       └───────────────────────────────────────────────────────────────► [Close Modal]
                                                                                 │
                                                                                 ▼
                                                          [Resume Turn Timer or Advance Turn]
```

---

## 4. Specific Hint Pricing Model

```csharp
// Hint purchase rule in BiblicalRouletteActor.cs
private const int SpecificHintCost = 5000;

if (turnPlayer.Score >= SpecificHintCost && !_rouletteState.HintRevealed)
{
    turnPlayer.Score -= SpecificHintCost;
    _rouletteState.HintRevealed = true;
}
```
