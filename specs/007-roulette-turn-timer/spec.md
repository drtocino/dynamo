# Feature Specification: Roulette Turn Timer, Spin Result Polish, and Hint Cost Adjustment

**Feature Branch**: `007-roulette-turn-timer`

**Created**: 2026-10-24

**Status**: Draft

**Input**: User description: "On the roulette game, set a timer for the turns sequence, on the game configuration there is already a time setting, so just use that configuration, when the time of a turn ends, then the turn is lost and the next player starts its turn, the first spin of a turn has always 15 more seconds than the regular timing, the timing is reset by an action which could be any of the following: spinning, purchasing a vowel, purchasing the hint, and should not start counting on the following events: when the solve modal is open, while the wheel is spinning, when the modal of roulette result are open, which gives place to the next spec for the spin result modal, it should disappear in 3 seconds and be wider, so the content is also bigger, focusing more on the roulette result and the letters found, spin total amount should be showed just with text as +100 and not in an own component. Make the hint cost be 5000. Add the timer on the top right, next to the turn score indicator."

## Clarifications

### Session 2026-10-24

- Q: How should turn timer expiration be enforced and synchronized across players? → A: Backend-authoritative deadline. Since turns depend entirely on the backend, the backend `BiblicalRouletteActor` manages `turnDeadlineUtc` (and pause states), broadcasts it in `BiblicalRouletteState`, and authoritatively advances the turn on expiration. Clients display the synchronized countdown.
- Q: Should the Spin Result modal retain a manual "Continue" button, or be strictly auto-dismiss only? → A: Keep "Continuar" button. The modal automatically dismisses after 3 seconds, but players can tap "Continuar" to dismiss early and resume gameplay without waiting.
- Q: Should the top-right turn timer badge display visual urgency alerts when time runs low? → A: Color-coded urgency alerts. The timer badge turns yellow at <=10 seconds and turns red with an active pulse animation at <=5 seconds to warn the active player.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Active Turn Countdown with First-Spin Grace Period (Priority: P1)

During a match of Biblical Roulette, players taking their turn have a clear, real-time countdown timer displayed on the top right of the screen, situated immediately adjacent to the turn score indicator. The baseline turn duration is derived directly from the host's session configuration (`timeLimitSeconds`, e.g. 60 seconds). Because a player just beginning their turn must assess the phrase board and available consonants, their first spin opportunity always receives a 15-second grace period (e.g. 75 seconds total). If the timer elapses to 0 seconds without a qualifying action, the turn is immediately forfeited (treated as a timeout / missed turn), and turn authority automatically transfers to the next player in the turn sequence.

**Why this priority**: Keeps group games engaging, prevents match stalling, and enforces fair, paced participation for both local shared-screen and remote multiplayer sessions.

**Independent Test**: Load a game configured with a 30s turn limit. Verify the initial turn timer starts at 45s (30s + 15s). Allow the timer to count down to 0 without interacting. Verify that the turn is forfeited and the next player becomes the active turn player with a fresh 45s timer.

**Acceptance Scenarios**:

1. **Given** a new turn begins for Player A, **When** the turn starts, **Then** the timer displays the configured turn limit plus 15 additional seconds (e.g., `config.timeLimitSeconds + 15`).
2. **Given** an active countdown, **When** the timer reaches 0 seconds without player action, **Then** the turn ends immediately, a turn-timeout notification is registered, and the turn advances to the next player.
3. **Given** the turn has advanced to the next player, **When** their initial turn state begins, **Then** their timer initializes with the first-spin duration (configured time + 15 seconds).
4. **Given** the game interface, **When** viewing the header bar, **Then** the countdown timer is clearly positioned on the top right, directly beside the active player's turn score badge.

---

### User Story 2 - Action-Based Timer Resets and Event-Based Pausing (Priority: P1)

When an active player performs a valid turn action—spinning the wheel, purchasing a vowel, or confirming the purchase of a hint—the countdown timer resets. For subsequent actions within the same turn (such as guessing another consonant after a successful spin or buying a vowel), the timer resets to the standard configured duration (without the initial 15-second grace bonus). Furthermore, the timer automatically pauses and does NOT count down during events where the player is waiting or focused on dedicated modal tasks:
1. While the Solve Verse modal is open (allowing uninterrupted input of their guess).
2. While the roulette wheel is actively executing its spin animation.
3. While the Spin Result modal is displayed on screen.

Once the modal closes or the animation completes, if the player retains turn authority, the timer resumes counting from the reset duration.

**Why this priority**: Prevents penalizing players during system-driven animations or while typing long verse guesses, creating a smooth and stress-free user experience.

**Independent Test**: Can be tested by spinning the wheel, opening the Solve modal, and purchasing a hint, confirming that the countdown pauses during each modal/spin state and resets back to the standard time limit upon action execution.

**Acceptance Scenarios**:

1. **Given** an active turn countdown, **When** the player initiates a spin (`SPIN_ROULETTE`), **Then** the countdown pauses immediately during the wheel rotation animation.
2. **Given** a player opens the Solve Verse modal, **When** the modal is visible, **Then** the timer halts and does not decrease.
3. **Given** a player closes or submits the Solve Verse modal without winning, **When** the modal closes and turn passes, **Then** the next player's timer starts fresh.
4. **Given** a player purchases a vowel or specific hint, **When** the action completes and the player keeps their turn, **Then** the timer resets to the standard configured time limit.
5. **Given** the Spin Result modal is actively open on screen, **When** displayed, **Then** the timer remains paused until the modal closes.

---

### User Story 3 - Streamlined & Impactful Spin Result Modal (Priority: P2)

Upon completion of a roulette spin, the Spin Result modal displays a redesigned, wider neobrutalist presentation that dramatically highlights the spin outcome and the count of letters found in the verse puzzle. The modal automatically dismisses after exactly 3 seconds, removing the need for manual button clicks and keeping the rhythm of the game fast and fluid. Rather than enclosing the points earned in a separate, cluttered component container, points are rendered directly as prominent inline text (e.g. `+100` or `+500 pts`) alongside the result details.

**Why this priority**: Eliminates repetitive clicking after every spin while maximizing visual excitement and legibility for both mobile screens and projected displays.

**Independent Test**: Spin the roulette and land on a letter. Verify the result modal appears significantly wider, displays the points earned simply as clean text (e.g., `+300`), highlights the letters found prominently, and automatically disappears after 3 seconds without user intervention.

**Acceptance Scenarios**:

1. **Given** a completed roulette spin, **When** the Spin Result modal appears, **Then** it automatically closes after 3 seconds without requiring user interaction.
2. **Given** the Spin Result modal is open, **When** viewed on screen, **Then** its container is wider than standard alert dialogs, emphasizing the wedge value and letters found in large, high-contrast typography.
3. **Given** a numeric points win on the wheel, **When** displayed in the modal, **Then** the total points earned are shown as simple inline text (e.g., `+100` or `+300 pts`) without redundant sub-component wrappers.
4. **Given** the 3-second auto-dismiss timer is running, **When** a user manually taps "Continue", **Then** the modal closes immediately without waiting for the timeout.

---

### User Story 4 - Calibrated Specific Hint Cost (5,000 Points) (Priority: P3)

The cost required to purchase the specific verse hint (which reveals the exact book chapter and verse) is adjusted to **5,000 points** (lowered from 10,000 points). All UI indicators, disabled button thresholds, confirmation dialogs, and backend validation enforce this 5,000-point price point consistently.

**Why this priority**: Ensures the hint is realistically attainable during standard 3-round matches while still remaining a meaningful strategic expenditure.

**Independent Test**: Give a player 4,999 points and verify the Hint button is disabled; give the player 5,000 points, verify the confirmation modal displays 5,000 points, and upon confirmation verify 5,000 points are deducted and the hint is revealed.

**Acceptance Scenarios**:

1. **Given** an active player with less than 5,000 points, **When** viewing the controls, **Then** the Hint button is disabled.
2. **Given** an active player with 5,000 points or more, **When** clicking the Hint button, **Then** the confirmation modal explicitly states a cost of 5,000 points.
3. **Given** the player confirms the purchase, **When** processed, **Then** exactly 5,000 points are deducted from the player's score and the specific hint becomes revealed to all players.
4. **Given** the phrase board locked badge, **When** the hint is not yet unlocked, **Then** the badge indicates "(5,000 pts)".

---

### Edge Cases

- **Timer Expiry during Multi-Round Play**: When the timer reaches 0 on the last second of a player's turn, the backend state machine authoritatively executes a turn transition to prevent duplicate submissions or out-of-order spins.
- **Race Condition on Last Second Action**: If a player submits a spin with less than 1 second remaining, the action receipt resets the timer and halts timeout processing.
- **Solve Modal Open on Timer Expiry**: Because the timer is strictly paused while the Solve modal is open, a player typing their solve guess cannot be timed out while the modal remains open.
- **Host Cancels Hint Confirmation Modal**: If the player opens the Hint Confirmation modal but clicks "Cancel", the turn timer continues running from its current value without resetting.
- **Shared Screen vs Networked Multiplayer**: The turn countdown applies equally in both Shared Screen mode and Networked Multiplayer mode, keeping group pace disciplined in both environments.
- **Zero or Negative Configured Time Limit**: If the session configuration sets `timeLimitSeconds` to 0 or an invalid value, the system defaults to 60 seconds (with 75 seconds for the first spin).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST read the turn time limit from the existing session configuration (`timeLimitSeconds`). If unspecified or invalid, the system MUST default to 60 seconds.
- **FR-002**: The system MUST grant 15 additional seconds beyond the configured time limit for the first action/spin of any player's turn (e.g. `configuredTime + 15`).
- **FR-003**: The system MUST display an active, visual countdown timer in the top-right header of the roulette game interface, immediately adjacent to the turn score indicator, featuring color-coded urgency alerts (turning yellow at <=10 seconds and pulsing red at <=5 seconds).
- **FR-004**: The backend actor MUST authoritatively manage the turn deadline, broadcast `turnDeadlineUtc` (and pause states) in `BiblicalRouletteState`, and advance to the next player in the turn sequence if the deadline expires without action.
- **FR-005**: The system MUST reset the turn countdown timer upon the successful execution of any of the following player actions:
  - Spinning the roulette (`SPIN_ROULETTE`)
  - Purchasing a vowel (`PURCHASE_VOWEL`)
  - Confirming the purchase of the specific hint (`PURCHASE_HINT`)
- **FR-006**: Subsequent actions within the same turn MUST reset the timer to the standard configured duration (`timeLimitSeconds`), not the initial first-spin duration.
- **FR-007**: The system MUST pause the countdown timer while the Solve Verse modal is open.
- **FR-008**: The system MUST pause the countdown timer while the roulette wheel is actively spinning.
- **FR-009**: The system MUST pause the countdown timer while the Spin Result modal is visible.
- **FR-010**: The Spin Result modal MUST automatically dismiss after exactly 3 seconds.
- **FR-011**: The Spin Result modal MUST allow manual dismissal before 3 seconds via the "Continue" action.
- **FR-012**: The Spin Result modal layout MUST feature a wider format that enlarges the visual result and letters found.
- **FR-013**: The points earned in the Spin Result modal MUST be displayed as direct text (e.g., `+100` or `+300 pts`) without being enclosed in a nested sub-component card.
- **FR-014**: The specific hint purchase cost MUST be set to exactly 5,000 points across backend validation, frontend button thresholds, confirmation dialogs, phrase board badges, and game logs.
- **FR-015**: All timer indicators, modal notices, and hint text MUST be localized in Spanish and English.

### Key Entities

- **TurnTimerState**: Tracks remaining seconds for the active turn, paused state, whether the current turn is awaiting its first spin (applying the +15s bonus), and references to active countdown intervals.
- **RouletteSessionConfig**: The existing session configuration carrying `timeLimitSeconds`, `rounds`, and game mode.
- **SpinResultDisplay**: Holds the current spin result label, prize amount, letters found count, and auto-dismiss timer handle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Turn countdown timer displays accurate remaining seconds with 100% synchronization against pause triggers (wheel spinning, solve modal, spin result modal).
- **SC-002**: When the countdown reaches 0 seconds, turn forfeiture and transition to the next player occurs in under 1 second.
- **SC-003**: The Spin Result modal auto-dismisses in exactly 3.0 seconds ($\pm 0.2$s) without requiring user clicks.
- **SC-004**: Players can verify the hint cost of 5,000 points and complete hint confirmation in under 3 seconds.

## Assumptions

- The existing session property `timeLimitSeconds` (defaulting to 60s when not explicitly set by the host) is the authoritative source for the base turn duration.
- Pausing the timer during the Solve modal is safe against abuse because the modal requires player interaction to guess the verse, and guessing incorrectly will forfeit the turn anyway.
- The 15-second first-spin bonus applies exclusively to the first action of a player's turn; once any action is taken (or after the first spin), remaining actions in that turn reset to the standard time limit.
- Neobrutalist design conventions (bold borders, high contrast badges, no generic styling) apply to the top-right timer badge and the widened Spin Result modal.
