# Phase 1: Game Contracts

## SignalR Hub: `GameHub`

The Biblical Roulette game will use the existing `GameHub` but define new typed events and commands specific to its state machine.

### Commands (Client -> Server)

- `SpinRoulette()`: Sent by the current turn player.
  - Server randomly selects a roulette value.
  - Transitions turn state to "AwaitingConsonant".
  - Broadcasts `RouletteSpun` with the value and rotation.

- `GuessConsonant(char letter)`: Sent after spinning.
  - Server evaluates the guess.
  - If found: multiplies count by spun value, adds to score, broadcasts `LettersRevealed`.
  - If not found: ends turn, broadcasts `TurnEnded`.

- `PurchaseVowel(char letter)`: Sent by the current player to buy a vowel.
  - Server validates points >= `CurrentVowelCost`.
  - If valid: deducts points, increments `CurrentVowelCost`, reveals vowel, broadcasts `LettersRevealed` and `PlayerScoreUpdated`.

- `PurchaseHint()`: Sent to buy the specific hint.
  - Validates player has 500 points.
  - Deducts points, broadcasts `HintPurchased`.

- `SolvePhrase(string phrase)`: Sent to explicitly guess the full phrase.
  - If correct: awards round win, transitions to next round.
  - If incorrect: ends turn immediately.

### Events (Server -> Client)

- `GameStateUpdated(BiblicalRouletteState state)`: Sends the full snapshot.
- `RouletteSpun(int value, int targetRotation)`: Tells clients where to animate the wheel.
- `LettersRevealed(char[] letters)`: Triggers animation on the board for the newly revealed letters.
- `TurnEnded(string nextPlayerId)`: Indicates the turn has passed.
- `RoundWon(string winnerId, string fullPhrase)`: Broadcast when a player solves the phrase.
- `GameFinished(string overallWinnerId)`: Broadcast when all rounds conclude.
