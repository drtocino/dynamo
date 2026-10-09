# Phase 1: Quickstart Validation Guide

This guide outlines how to validate the Biblical Roulette feature end-to-end once implemented.

## Prerequisites

- Dynamo backend running on `http://localhost:5000`
- Dynamo frontend running on `http://localhost:4200`
- PostgreSQL database seeded with at least 3 `Phrase` entries.

## Validation Scenarios

### 1. Game Initialization & Lobby

1. Open 3 browser tabs pointing to `http://localhost:4200/sessions`.
2. In Tab 1, create a new room and select "Biblical Roulette".
3. In Tabs 2 and 3, join the room using the room code.
4. Verify the shared screen (Tab 1) shows the game lobby with all 3 players.
5. Tab 1 starts the game.
6. Verify all clients transition to the `BiblicalRoulette` active match route.
7. Verify the shared screen displays the hangman board, the roulette wheel, and the general hint.

### 2. Turn Sequence and Spinning

1. Note which player's turn it is based on the randomized `TurnSequence`.
2. On that player's device, tap "Spin".
3. Verify the `RouletteSpun` event triggers a pure CSS rotation animation on the shared screen wheel.
4. Wait for the wheel to land on a cash value (e.g., 200).
5. On the player's device, select a consonant.
6. **Scenario A (Hit):** Select a consonant that exists. Verify the letter appears on the board and the player's score increases by (count × 200). Verify the player retains their turn.
7. **Scenario B (Miss):** Spin again, select a consonant that does NOT exist. Verify score is unchanged and the active turn passes to the next player.

### 3. Vowel Purchasing

1. Ensure a player has at least 100 points.
2. During their turn (before spinning), they tap "Buy Vowel".
3. Verify the vowel store modal opens on their device.
4. Select a vowel. Verify 100 points are deducted.
5. Verify the next time ANY player opens the vowel store, the cost shows as 250 points.

### 4. Bankrupt

1. Using the backend debugging tools (or luck), force a "Bankrupt" spin for a player with points.
2. Verify their score resets to 0.
3. Verify their turn ends immediately.

### 5. Winning the Round

1. On a player's turn, select "Solve Phrase".
2. Enter the exact phrase text.
3. Verify the `RoundWon` event is broadcast.
4. Verify the game transitions to Round 2.
5. Play through 3 rounds and verify the overall winner is declared based on `RoundsWon`.
