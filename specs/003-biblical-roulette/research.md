# Phase 0: Outline & Research

## Technical Unknowns and Decisions

**Decision**: Authoritative Backend with SignalR
- **Rationale**: Based on Dynamo's core principles, the backend should be the source of truth for all game state. SignalR handles real-time synchronization. The game state machine, scoring (multiplier of letters × wheel spin value), vowel dynamic cost increment, and turn sequences will be processed purely on the backend.
- **Alternatives considered**: Client-side prediction with peer-to-peer logic. Rejected because it violates the "Everything should be done using backend logic management" requirement.

**Decision**: Pure Angular CSS Roulette Wheel
- **Rationale**: User constraints explicitly forbid external chart/wheel libraries and require pure Angular components. We will use a standard HTML/CSS approach, rendering pie slices using `conic-gradient` or CSS rotation, and applying a CSS `transform: rotate()` to simulate the spinning animation. The backend will transmit the final resting angle or the target prize, and the frontend will compute the necessary rotation offset.
- **Alternatives considered**: Canvas-based custom rendering. Rejected because standard CSS transforms are easier to maintain within Angular templates and satisfy the constraint.

**Decision**: NgRx SignalStore for UI State
- **Rationale**: Fits with the existing project frontend architecture. The Store will mirror the server's `BiblicalRouletteState`.

**Decision**: Vowel Store Modal
- **Rationale**: Implemented via an Angular overlay/modal component, triggered by the user when they have the necessary points and it's their turn.

*All Technical Context unknowns have been resolved.*
