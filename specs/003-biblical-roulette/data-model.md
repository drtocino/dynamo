# Phase 1: Data Model

## Entities

### `GameSession` (Extended for Biblical Roulette)
*Tracks the overall match session.*
- `SessionId` (Guid): Unique identifier
- `Mode` (Enum): `MultiplayerMode.BiblicalRoulette`
- `State` (Enum): `Lobby`, `Starting`, `InGame`, `Finished`
- `BiblicalRouletteState` (Object): Container for game-specific state
- `Players` (List of PlayerState): Participant tracking

### `BiblicalRouletteState`
*Holds the state specific to this game mode.*
- `CurrentRoundIndex` (Int): Which phrase is being played (e.g., 1 of 3)
- `TotalRounds` (Int): Total rounds in the game (e.g., 3)
- `CurrentPhraseId` (Guid): Reference to the phrase in the database
- `RevealedConsonants` (List of Char): Consonants successfully guessed or spun
- `RevealedVowels` (List of Char): Vowels purchased
- `CurrentTurnPlayerId` (String): ID of the player currently taking their turn
- `TurnSequence` (List of String): Randomized list of player IDs for the current round
- `CurrentVowelCost` (Int): Next cost for a vowel (100, 250, 500, 1000)
- `HintRevealed` (Bool): Whether the specific 500-point hint has been purchased
- `LastSpinResult` (String/Int): The value landed on in the last spin, or "Bankrupt"

### `Phrase` (Database Entity)
*Stores the hidden verses and hints.*
- `Id` (Guid): Unique identifier
- `Text` (String): The full verse or phrase to guess
- `GeneralHint` (String): E.g., "New Testament Book"
- `SpecificHint` (String): E.g., "Written by Paul"
- `CategoryId` (Guid): To organize phrases by theme

### `PlayerState` (Extended)
*Tracks individual player progress.*
- `Score` (Int): Current accumulated points in the game
- `RoundsWon` (Int): Number of phrases this player has explicitly guessed correctly
