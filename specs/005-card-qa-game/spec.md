# Feature Specification: Card Question & Answer Game

**Feature Branch**: `005-card-qa-game`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "Build a new game that wlil go to the games section (folder) which main goal is just to show questions and answers on cards. The cards are initially all faced down so they have to be turned up on click to show the question and on a second click they show the answer, it does not show correct status, the manager of the game can set if the question has been answered correct though and count it for that player, each player will be answering 5 questions (count of questions configurable) which will be picked from a 20 (5x4) cards shown on screen. The recorded results for each player on each question should be kept on a list that is not shown (shown by a modal open). When a new round is started (player turn of 5 configurable questions) a name of player should be set so the next 5 (configurable) questions are answered on their name. The faced down cards should be numbered from 1 to 20 (or if configured to have more cards then should be numbered from lowest number to highest number), when a card picked it is expanded on the screen bluring the background (as the modal but with the same size of the card) turning the cards should have an animation of that action also when clicking again to show the answer should also turn the card but without closing the modal (with a turning animation). Some questions can come from the db but the configuration of the game should allow to use custom questions instead, created by the game admin who will create questions saved on local storage. The available type of questions are: true/false, option selection, open question (a proposed answer not absolute) the answers won't be write down or selected, just should be shown on screen and when clicked just show the answer, under the answer the match admin selects if the answer was right or not, after that one more click closes the modal and an already selected card is shown disabled."

## Clarifications

### Session 2026-10-18

- Q: What multiplayer architecture is required for this game? → A: Strictly shared-screen only (facilitated on a single screen/display by the host; no mobile player client connections or network/WebSocket synchronization required).
- Q: How should match conclusion and winner declaration be handled? → A: No formal winner modal; the host views scores via the Results Modal whenever desired and manually resets the board.
- Q: Should the custom questions manager include JSON export/import? → A: Yes, provide JSON export and import in the custom question manager so leaders can back up and transfer question sets between devices.
- Q: How should default 'database questions' be sourced and loaded? → A: Dedicated backend API endpoint (`/api/games/card-qa/questions`) querying questions from the database filtered by language, with a local pre-seeded fallback if the backend is unreachable.
- Q: Should the host be allowed to correct an accidental evaluation from within the Results Modal? → A: Yes, allow the host to toggle the correct/incorrect status of any recorded question directly in the Results Modal to correct accidental misclicks.
- Q: If the host accidentally clicks the wrong card number, can it be returned faced-down? → A: No, once a card is opened it must be completed and evaluated; it cannot be returned to a faced-down state.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Host and Players Interact with the Numbered Card Grid (Priority: P1)

A game host launches the Card Q&A game on a shared or projected screen. The screen displays a grid of faced-down cards numbered sequentially from 1 to N (default 20 arranged in a 5x4 grid). When a player or host selects a card, the card expands to the center of the screen with a blurred background backdrop. The card reveals the question with a smooth turning/flip animation. The answer is hidden initially. Upon a second click, the card executes another turning/flip animation to reveal the answer without closing the modal. Directly beneath the revealed answer, the host marks whether the player answered correctly or incorrectly. A subsequent click closes the modal, returning to the board where the selected card is now disabled and cannot be picked again.

**Why this priority**: This represents the foundational gameplay loop and visual interaction of the card board, essential for delivering MVP value.

**Independent Test**: Can be tested by loading the game with default cards, clicking card #1, verifying that it expands with blurred background, clicking to flip from question to answer with animation, marking it correct, closing the modal, and verifying card #1 is rendered disabled.

**Acceptance Scenarios**:

1. **Given** a new game session, **When** the board renders, **Then** all 20 cards are displayed faced-down, sequentially numbered from 1 to 20 in a 5x4 grid.
2. **Given** faced-down cards, **When** the host clicks an active numbered card, **Then** the card expands to the center of the screen, the background blurs, and the card animates its flip to display the question.
3. **Given** an expanded card displaying a question, **When** clicked again, **Then** the card flips with a turning animation to show the answer, while keeping the modal open.
4. **Given** a revealed answer, **When** the host marks the response as either "Correct" or "Incorrect", **Then** the evaluation status is recorded for the active player.
5. **Given** an evaluated card, **When** clicked to dismiss, **Then** the modal closes, the blurred background disappears, and the card on the grid appears disabled and unresponsive to further clicks.

---

### User Story 2 - Player Turn Management and Question Quota (Priority: P1)

Before answering questions, the host registers the active player by entering their name to initiate a round. During this player's round, the player selects and answers a configurable number of questions (default 5 questions) from the board. The game tracks the number of questions answered in the current turn. Once the player has completed their question quota, the turn completes, and the host is prompted to begin the next player's round with a new player name.

**Why this priority**: Organizing gameplay into distinct, named player turns with quotas ensures fair group participation and structured match flow.

**Independent Test**: Can be tested by starting a round with player name "Alice", answering 5 cards, verifying each card is attributed to Alice, and confirming that the turn ends after the 5th card with a prompt for the next player.

**Acceptance Scenarios**:

1. **Given** the start of a round, **When** prompted, **Then** the host must input the player's name before cards can be selected for that round.
2. **Given** an active player round, **When** each card is evaluated and closed, **Then** the turn progress indicator updates (e.g., "Question 2 of 5").
3. **Given** a player has answered their final allowed question (e.g., 5th question), **When** the modal is closed, **Then** the round for that player concludes and the system allows initiating the next player's turn.
4. **Given** a completed round, **When** the host starts the next round, **Then** a new player name is entered and the remaining active cards on the board remain available.

---

### User Story 3 - Hidden Results List and Scoreboard Modal (Priority: P2)

During or at the end of the game, the host can view the detailed results without permanently cluttering the primary play board. Clicking an on-demand button opens a Results Modal displaying a breakdown of all players, the questions they answered, the card numbers chosen, and whether each response was marked correct or incorrect, along with their total score.

**Why this priority**: Preserves a clean, distraction-free projector display during trivia while still giving hosts and players full transparency on scores and detailed question histories.

**Independent Test**: Can be tested by playing multiple cards across multiple players, opening the Results Modal, verifying all player entries and correct/incorrect counts match actual play, and closing the modal to resume the game.

**Acceptance Scenarios**:

1. **Given** active gameplay, **When** viewing the main board, **Then** the full results list remains hidden from the main view to maintain a clean presentation.
2. **Given** active or completed rounds, **When** the host clicks "View Results", **Then** a modal opens displaying each player's name, total correct answers, and a line-item breakdown of answered questions and results.
3. **Given** the Results Modal is open, **When** the host clicks the close button or backdrop, **Then** the modal closes and the game board state is preserved.
4. **Given** the Results Modal is open, **When** the host decides to conclude or restart the match, **Then** the host can trigger a manual board reset without the system forcing an automatic winner popup modal.
5. **Given** the Results Modal is open, **When** the host clicks on an evaluated question result, **Then** the host can toggle its status between Correct and Incorrect, immediately recalculating the player's total correct count.

---

### User Story 4 - Game Configuration & Custom Questions in Local Storage (Priority: P2)

The game admin can configure game settings and manage custom questions. The settings allow customizing the total number of cards on screen (e.g., 12, 16, 20, 24) and the number of questions per round (default 5). The admin can choose between database-sourced questions or custom questions. The custom question manager allows the admin to create, edit, delete, and store questions directly in the browser's local storage. Supported question types include:
1. True / False
2. Option Selection (Multiple Choice: question with predefined options displayed)
3. Open Question (Question with a proposed reference answer for host judgment)

**Why this priority**: Youth leaders and game hosts require the flexibility to tailor questions to their specific themes, retreats, and group sizes without code modifications.

**Independent Test**: Can be tested by entering the configuration screen, adding a custom True/False question and an Option Selection question, saving to local storage, starting a match with custom questions enabled, and verifying the custom questions appear on the cards.

**Acceptance Scenarios**:

1. **Given** the game configuration screen, **When** the admin adjusts the total card count (e.g., 16) and questions per player (e.g., 3), **Then** the game board adjusts its grid and turn limits accordingly.
2. **Given** the custom question editor, **When** the admin creates a question selecting "True / False", "Option Selection", or "Open Question", **Then** the question and its answer payload are saved in the browser's local storage.
3. **Given** custom questions stored in local storage, **When** the admin selects "Custom Questions" mode, **Then** cards draw randomly from the stored custom question set.
4. **Given** an "Option Selection" card, **When** expanded, **Then** the options are presented clearly on the card face alongside the question, and clicking reveals the correct option.
5. **Given** an "Open Question" card, **When** flipped to the answer side, **Then** a proposed reference answer is displayed for the host to judge against the player's verbal response.
6. **Given** custom questions created in the custom question manager, **When** the admin triggers "Export JSON", **Then** the question pack is exported as a JSON file; and **When** the admin selects a valid question pack JSON file via "Import JSON", **Then** the questions are parsed, validated, and saved into local storage.

---

### User Story 5 - Database-Sourced Questions Integration (Priority: P3)

When configured to use database questions, the game loads questions pre-seeded in the database matching the application's configured language (default Spanish, optional English). If no custom questions are provided, the system seamlessly defaults to the database question set.

**Why this priority**: Provides instant, zero-setup gameplay for hosts who want ready-to-play biblical and thematic trivia right out of the box.

**Independent Test**: Can be tested by selecting "Database Questions" mode and starting a match, verifying that questions are loaded from the database matching the active platform language.

**Acceptance Scenarios**:

1. **Given** the game configuration set to "Database Questions", **When** a match starts, **Then** cards are populated from questions retrieved via the backend `/api/games/card-qa/questions` endpoint matching the active language.
2. **Given** the application language is set to Spanish, **When** database questions are retrieved, **Then** only Spanish questions are presented.
3. **Given** the application language is set to English, **When** database questions are retrieved, **Then** English questions are presented.
4. **Given** database questions mode is selected, **When** the backend endpoint is unreachable (offline environment), **Then** the game automatically falls back to bundled pre-seeded questions so gameplay is not disrupted.

---

### Edge Cases

- **What happens when the board runs out of cards before players finish their turns?**
  If all cards on the board are disabled while a player still has remaining questions in their quota, the system detects that no active cards remain, concludes the round early, and displays a notification indicating that the board is complete with a prompt to view final results or reset the board.
- **What happens if there are fewer custom questions in local storage than the configured card count?**
  The system validates the question pool before starting. If fewer questions exist than the card count, an alert notifies the host, offering either to reduce the card count to match available questions or fallback to database questions.
- **What happens if the host closes or clicks outside the modal without marking Correct or Incorrect?**
  The modal cannot be dismissed by clicking the backdrop or pressing escape without evaluation. Once opened, a card must be completed and evaluated as Correct or Incorrect before the modal can close, ensuring the turn step is finished and the card is disabled. If an accidental misclick occurs, the host can correct the evaluation in the Results Modal.
- **What happens if a player name is left blank when starting a round?**
  The start-round confirmation requires a non-empty player name (trimmed of whitespace) before enabling the board.
- **What happens if the browser is refreshed mid-game?**
  The ongoing match state (active player, picked cards, scores, recorded results) is preserved in session storage or state so a refresh does not forfeit the active match.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render an on-screen grid of faced-down cards, sequentially numbered from 1 to N (default 20 cards in a 5x4 grid).
- **FR-002**: The system MUST allow the game admin to configure the total number of cards displayed on the board.
- **FR-003**: The system MUST allow the game admin to configure the number of questions answered per player turn (default 5 questions).
- **FR-004**: The system MUST require the host to set an active player's name before cards can be selected for that player's round.
- **FR-005**: When a faced-down card is clicked, the system MUST expand the card in the center of the screen with a blurred background overlay.
- **FR-006**: When expanding a card, the system MUST animate the card flipping/turning from its numbered back face to reveal the question on the front face.
- **FR-007**: When an expanded question card is clicked again, the system MUST execute a turning/flip animation to reveal the answer side without closing the modal overlay.
- **FR-008**: The system MUST NOT automatically evaluate or enforce user answers through text input or interactive option picking during gameplay; questions and answers are presented visually for host-facilitated play.
- **FR-009**: Beneath the revealed answer, the system MUST present the host with controls to mark the question as either "Correct" or "Incorrect" for the active player.
- **FR-010**: Upon concluding the evaluation, an additional click MUST close the modal and disable the selected card on the grid so it cannot be selected again in the current game.
- **FR-011**: The system MUST record each question result (card number, question text, player name, correct/incorrect evaluation, timestamp/order) into a match results list.
- **FR-012**: The full results list MUST be kept hidden from the main game board during play, accessible via an on-demand modal ("View Results").
- **FR-013**: The Results Modal MUST display all participating players, total questions answered, total correct responses, and the itemized answer history.
- **FR-014**: The system MUST support three distinct question types:
  - **True / False**: Displays a statement with True and False indicators on the question face, revealing the correct boolean answer on the answer face.
  - **Option Selection (Multiple Choice)**: Displays a question prompt along with candidate options on the question face, revealing the correct option on the answer face.
  - **Open Question**: Displays an open-ended question prompt on the question face, revealing a proposed reference answer on the answer face for host adjudication.
- **FR-015**: The system MUST support two question sourcing options: Database Questions and Custom Questions.
- **FR-016**: The system MUST provide an administrative interface allowing hosts to create, view, edit, and delete custom questions stored in the browser's local storage.
- **FR-017**: The system MUST allow custom questions stored in local storage to be tagged with their question type (True/False, Option Selection, Open Question) and language.
- **FR-018**: When database questions are enabled, the system MUST query questions from the backend API endpoint (`/api/games/card-qa/questions`) filtered by the active application language (default Spanish, secondary English).
- **FR-019**: The system MUST track the active player's question quota during their turn and notify the host when the quota is reached.
- **FR-020**: The system MUST adopt the Dynamo Neobrutalist visual identity (bold borders, stark drop shadows, vibrant high-contrast fills, chunky typography, smooth comic-inspired flip animations) consistent across all views and modals.
- **FR-021**: The game MUST operate exclusively as a local shared-screen experience on a single host device/display, with no mobile player client connections or remote network synchronization required.
- **FR-022**: The system MUST NOT force an automatic winner popup modal; the host views scores via the Results Modal and manually resets the board when desired.
- **FR-023**: The custom question manager MUST support exporting stored questions to a downloadable JSON file and importing valid JSON question packs into local storage.
- **FR-024**: The system MUST provide bundled pre-seeded questions as an offline fallback when database questions mode is selected but the backend API is unreachable.
- **FR-025**: The system MUST allow the host to toggle the Correct/Incorrect status of any recorded question directly within the Results Modal, dynamically updating the player's total score and summary.
- **FR-026**: Once a card is opened, the system MUST require it to be completed and evaluated as Correct or Incorrect before the modal can close; it cannot be returned to a faced-down unselected state.

### Key Entities *(include if feature involves data)*

- **Card**: Represents an individual board position, including its sequential number (1..N), state (faced-down, expanded-question, expanded-answer, disabled/used), and associated Question.
- **Question**: Represents a trivia item, containing:
  - `id`: Unique identifier.
  - `text`: The question prompt.
  - `type`: Question type (`true-false`, `option-selection`, `open-question`).
  - `options`: Optional list of candidate choices (for option selection).
  - `answer`: The correct or proposed answer text.
  - `language`: Language code (e.g., `es`, `en`).
  - `source`: Source origin (`database` or `local-storage`).
- **PlayerRound**: Represents a player's turn in a match, containing the player's name, total question quota (e.g., 5), current progress count, and list of evaluated results.
- **QuestionResult**: Represents an individual evaluated outcome, linking `playerName`, `cardNumber`, `questionId`, `questionText`, `isCorrect` (boolean), and `timestamp`.
- **GameConfiguration**: Holds match parameters including `totalCardCount` (e.g., 20), `questionsPerTurn` (e.g., 5), `questionSource` (`database` vs `custom`), and `selectedLanguage`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A game host can configure and launch a new Card Q&A board in under 30 seconds.
- **SC-002**: Card expansion and flip animations complete smoothly in under 400ms without visual stutter or layout shifting.
- **SC-003**: 100% of evaluated questions are accurately recorded and immediately reflected in the Results Modal upon opening.
- **SC-004**: Admins can author and save a new custom question to local storage in under 45 seconds.
- **SC-005**: Disabled cards are visually unmistakable on the grid, with a 0% accidental re-selection rate.
- **SC-006**: All UI text, buttons, and system messages adhere to the platform's internationalization system with 100% coverage in Spanish (default) and English.

## Assumptions

- **Host-facilitated presentation**: The game is designed primarily for shared-screen or projector play where a host or youth leader controls the board, while youth participants in the room shout or state their answers verbally before the host reveals the answer and marks the score.
- **No player typing during gameplay**: Answers are not typed into the input by players during the active card flip; the card simply reveals the answer and the host judges whether the verbal answer was correct.
- **Local Storage scoping**: Custom questions authored by an admin are stored in the host browser's `localStorage` and persist between browser sessions on that machine.
- **Independent game module**: In accordance with Constitution Principle II (Extensible Games Platform), this game resides in its own self-contained game module under `frontend/src/app/features/games/card-qa/` (or matching conventions) and registers with the Game Hub without modifying existing games or core routing infrastructure.
- **Neobrutalist styling**: The card turning animations and modal presentations will follow the established Dynamo Neobrutalist design tokens (chunky borders, solid shadows, crisp contrasting colors).
