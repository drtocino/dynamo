# Quickstart: Authoritative Multiplayer Engine Validation

This guide explains how to validate the SignalR connections and NgRx SignalStore integration locally.

## Prerequisites
- Node.js & Angular CLI installed.
- .NET 8 SDK installed.
- Supabase (PostgreSQL) running locally or accessible.

## Setup & Run

1. **Start the Backend**
   ```powershell
   cd c:\projects\dinamo\dynamo\backend\src\Dynamo.Api
   dotnet run
   ```
   *Expected Output*: The server starts on `https://localhost:5001`. SignalR is mapped to `/hub/game`.

2. **Start the Frontend**
   ```powershell
   cd c:\projects\dinamo\dynamo\frontend
   npm start
   ```
   *Expected Output*: Angular development server runs on `http://localhost:4200`.

## Validation Scenario: High-Frequency Tick Broadcast

1. Open two browser windows to `http://localhost:4200/lobby`.
2. Create a room in Window A. Join the room in Window B.
3. Open the browser's Developer Tools -> Network -> WS (WebSockets) in Window A.
4. Verify a connection to `wss://localhost:5001/hub/game` is established.
5. In the WS frames tab, you should see `ReceiveStateDelta` messages arriving at a fixed interval (e.g., every 100ms) representing the Session Actor's ticking loop.

## Validation Scenario: Client-Side Prediction

1. In Window B, trigger a game input (e.g., clicking a button).
2. The UI in Window B must update **immediately** (within 16ms), powered by the NgRx SignalStore `PredictionBuffer`.
3. Check the WS frames to see the `SubmitIntent` message sent to the server.
4. Moments later, the server's `ReceiveStateDelta` should acknowledge the sequence number, and the local `AuthoritativeStateMirror` syncs with the confirmed state.
