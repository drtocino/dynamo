# Quickstart & Validation Guide: Game Hub & Session Foundation

This guide outlines how to manually validate the end-to-end functionality of the Game Hub and Session Foundation using REST calls or frontend interactions.

## Prerequisites
- Supabase instance running (local or cloud).
- .NET API backend running.
- Angular frontend running.

## Scenario 1: Browse Games
**Goal**: Verify that mock games load in the hub.
1. Open the Angular app at `http://localhost:4200/`.
2. The homepage should display a list of games (e.g., "Trivia Pro", "Pictionary Mock").
3. **API Equivalent**:
   ```bash
   curl -X GET http://localhost:5000/api/v1/games
   ```

## Scenario 2: Create a Room-Based Match
**Goal**: Verify a host can create a session and get a room code.
1. Click on "Trivia Pro" in the hub.
2. Select "Room-Based Multiplayer".
3. Configure settings (e.g., Max Players: 8, Rounds: 3) and submit.
4. The app transitions to the Lobby, displaying a `roomCode`.
5. **API Equivalent**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/sessions \
        -H "Content-Type: application/json" \
        -d '{"gameId": "trivia-pro", "mode": "RoomBased", "hostClientId": "host-uuid-1", "settings": {"maxPlayers": 8, "rounds": 3}}'
   ```

## Scenario 3: Join an Existing Match
**Goal**: Verify another client can join the session.
1. Open an incognito window at `http://localhost:4200/join`.
2. Enter the `roomCode` generated in Scenario 2.
3. Enter player name "Alice".
4. The app transitions to the Lobby. The host window should update to show "Alice" joined.
5. **API Equivalent**:
   ```bash
   # Add player
   curl -X POST http://localhost:5000/api/v1/sessions/{sessionId}/players \
        -H "Content-Type: application/json" \
        -d '{"clientId": "client-uuid-2", "name": "Alice"}'
   ```

## Scenario 4: Start Match and Return to Lobby
**Goal**: Verify the lifecycle transitions.
1. In the host window, click "Start Match". Both windows transition to the Active Match view (placeholder).
2. Simulate match end (e.g., via an admin button or API call).
3. Both windows automatically return to the Lobby view with the same configuration.
