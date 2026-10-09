# Feature Specification: Biblical Roulette

**Feature Branch**: `[###-feature-name]`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "Create a game called biblical roulette which should allow the following rules:
- Shared screen type of game that allows 2 - 6 players with per turns game where the main objective is to guess the phrase or verse on screen, similar to the hangman game, where there are a specific number of spaces for each letter
- Each turn the player should select a letter as the one in the hangman game which allows to pick letters from an alphabet, after that the player is allowed to spin the roulette and based on the number of letters found on the phrase the score for the current turn will be letter count x roulette amount value, the letters found and score will be revealed after spinning the roulette.
- On the alphabet where letters are picked, there should be only consonants, vowels must be purchased with the points collected by the turns spin and letter guess, just one vowel per turn
- The values on the roulette are like cash prizes, and there is one that is called bank rupt, loosing all the money"

## Clarifications

### Session 2026-10-09

- Q: User-provided clarification on vowel costs → A: Purchasing vowels increases the price per purchase (100 -> 250 -> 500 -> 1000).
- Q: User-provided clarification on misses → A: When no letter is found on regular pick and spin, the turn ends and the next player takes their turn.
- Q: User-provided clarification on winning/hints → A: The final winner is the one with the most guessed phrases. There are 2 hints: 1 general shown from the start, 1 specific which can be purchased.
- Q: User-provided clarification on turns sequence → A: Turn sequence is set randomly by luck at the start of each round.
- Q: How many rounds/phrases are played in a single match? → A: A fixed number (e.g., 3 rounds).
- Q: What is the cost to purchase the specific hint? → A: 500 points.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Host initiates and players join a match (Priority: P1)

The host starts a new Biblical Roulette game and players (2-6) join the session on a shared screen.

**Why this priority**: Essential starting point for the game to function.

**Independent Test**: Can be fully tested by creating a lobby, having 2-6 players join, and verifying the game initializes correctly.

**Acceptance Scenarios**:

1. **Given** a host in the game lobby, **When** they select "Biblical Roulette" and open a room, **Then** a shared screen waiting room is displayed.
2. **Given** an open waiting room, **When** 2-6 players join via their devices, **Then** they appear on the shared screen and the game can be started.
3. **Given** an active game, **When** players look at the shared screen, **Then** they see a hidden phrase/verse and current players' scores.

---

### User Story 2 - Player takes a turn by spinning the roulette and picking a consonant (Priority: P1)

A player spins the roulette wheel to determine a turn value, then guesses a consonant in the phrase.

**Why this priority**: This is the core gameplay loop of Biblical Roulette.

**Independent Test**: Can be tested by forcing a turn, spinning the wheel, picking a consonant, and verifying score calculation based on letters found.

**Acceptance Scenarios**:

1. **Given** it is a player's turn, **When** they spin the roulette, **Then** the wheel stops on a specific cash prize value or "bankrupt".
2. **Given** a cash prize spun, **When** the player selects a consonant that exists in the phrase, **Then** the letters are revealed on screen and their score increases by (letter count × spun value).
3. **Given** a cash prize spun, **When** the player selects a consonant that does not exist in the phrase, **Then** their score does not increase, their turn ends, and the next player's turn begins.
4. **Given** a "bankrupt" spin, **When** the roulette stops, **Then** the player loses all their accumulated points, their turn ends immediately, and the next player's turn begins.

---

### User Story 3 - Player purchases a vowel (Priority: P2)

A player uses their accumulated points to purchase a vowel instead of guessing a consonant or spinning the wheel.

**Why this priority**: Adds strategic depth and uses the points system as an in-game currency, but isn't strictly required for the most basic MVP.

**Independent Test**: Can be tested by giving a player enough points and verifying they can purchase a vowel and the score deducts accordingly.

**Acceptance Scenarios**:

1. **Given** a player has enough points, **When** they choose to buy a vowel during their turn, **Then** the required points are deducted from their score (increasing the cost for the next purchase: 100 -> 250 -> 500 -> 1000) and they select a vowel.
2. **Given** a selected vowel that exists in the phrase, **When** it is chosen, **Then** the vowel is revealed on the board.
3. **Given** a player has purchased a vowel, **When** they try to purchase another in the same turn, **Then** they are prevented from doing so.
4. **Given** a player has 500 points, **When** they purchase the specific hint, **Then** the points are deducted and the specific hint is revealed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support a shared-screen interface displaying the hidden phrase, available alphabet, roulette wheel, and player scores.
- **FR-002**: System MUST allow 2 to 6 players to join the game session.
- **FR-003**: System MUST provide a turn-based system where each player takes actions sequentially.
- **FR-004**: System MUST present phrases or verses resembling a hangman-style board with blank spaces for each letter.
- **FR-005**: System MUST divide the alphabet into consonants (free to guess after spinning) and vowels (purchasable with points).
- **FR-006**: System MUST feature a roulette wheel with multiple values including cash prizes and a "bankrupt" option.
- **FR-007**: System MUST calculate score additions as (number of letters found) × (spun roulette value).
- **FR-008**: System MUST deduct points and reveal the letter when a player successfully purchases a vowel.
- **FR-009**: System MUST restrict vowel purchases to a maximum of one per turn.
- **FR-010**: System MUST reset a player's score to zero and end their turn if they spin "bankrupt".
- **FR-011**: System MUST declare the final winner as the player with the most explicitly guessed phrases at the end of the game (which consists of a fixed number of rounds, e.g., 3 rounds).
- **FR-012**: System MUST scale the cost of purchasing a vowel per purchase in the sequence: 100, 250, 500, and 1000 points.
- **FR-013**: System MUST randomly determine the turn sequence of players at the start of each round.
- **FR-014**: System MUST display a general hint from the beginning of the round.
- **FR-015**: System MUST allow players to purchase a specific hint for exactly 500 points.

### Key Entities *(include if feature involves data)*

- **Game Session**: Represents the active multiplayer match, tracking the current turn, players, and shared state.
- **Player**: Represents a participant in the match, tracking their score and turn status.
- **Phrase/Verse**: The hidden text to be guessed, including its category or hint.
- **Roulette Wheel**: The set of possible spin outcomes (values and bankrupt).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can successfully complete a full game of Biblical Roulette from lobby creation to final winner declaration without technical interruptions.
- **SC-002**: Score calculations correctly apply the multiplier (letter count × spun value) 100% of the time.
- **SC-003**: The system handles simultaneous connections from up to 6 players and 1 shared screen with state synchronization occurring in under 500ms.
- **SC-004**: Users are prevented from selecting vowels unless they have the required points balance.

## Assumptions

- Users have stable internet connectivity to maintain the real-time shared state.
- The game requires a main display (TV/Monitor) to act as the shared screen and individual mobile devices as controllers.
- An existing library of biblical phrases/verses will be provided or seeded into the database.
- The phrase length will fit on a standard 16:9 shared screen display.
