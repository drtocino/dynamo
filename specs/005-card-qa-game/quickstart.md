# Quickstart & Verification Guide: Card Question & Answer Game

**Feature**: `specs/005-card-qa-game`  
**Date**: 2026-10-18  

This guide provides step-by-step verification procedures to validate that the Card Question & Answer game functions correctly end-to-end.

---

## Prerequisites

1. Frontend development server running (`npm start` in `frontend/`, default port `4200`).
2. Backend API running (`dotnet run --project backend/src/Dynamo.Api`, default port `5000` or `5173`).
3. Browser opened to `http://localhost:4200`.

---

## Scenario 1: Numbered Card Grid & 3D Flip Card Q&A Loop

**Goal**: Verify the 5x4 grid, expanding modal, 3D flip animation, host evaluation, and card disabling.

1. Navigate to the Game Hub: `http://localhost:4200/`.
2. Locate the **Card Q&A** game card in the catalog and click **Play**.
3. **Verify**:
   - The screen renders a 5x4 grid of 20 numbered cards (numbered 1 through 20).
   - All cards are face-down with neobrutalist outlines and shadows.
4. When prompted, enter a player name: e.g., `"David"` and confirm to start round.
5. Click **Card #7**:
   - **Expected**: Card #7 smoothly expands to the center of the display with a backdrop blur (`backdrop-blur-md`).
   - The card performs a 3D flip animation revealing the Question face.
   - The answer is not visible.
6. Click anywhere on the expanded card:
   - **Expected**: The card performs another 3D flip animation revealing the Answer face without closing the modal.
   - Directly beneath the answer, the host sees controls: **Correct** (green) and **Incorrect** (coral/red).
7. Click **Correct**:
   - **Expected**: The modal closes, returning to the board.
   - Card #7 is now rendered with a disabled, grayed/muted neobrutalist styling.
   - Clicking Card #7 does nothing (it cannot be reopened).
   - The turn progress indicator updates to "Question 1 of 5".

---

## Scenario 2: Player Round Progression & Quota Completion

**Goal**: Verify that player rounds enforce the configurable question quota (default 5 questions) and cleanly transition to the next player.

1. Continue playing with player `"David"`.
2. Answer 4 more cards (e.g., #2, #5, #11, #18), marking some correct and some incorrect.
3. Upon evaluating the 5th card:
   - **Expected**: The round for `"David"` finishes (5/5 questions reached).
   - The system displays a round completion banner/modal prompting the host to register the next player: e.g., `"Sarah"`.
4. Enter `"Sarah"` and confirm.
5. **Expected**:
   - The remaining unpicked cards on the board remain available (e.g. 15 active cards remain).
   - Sarah's turn counter begins at "Question 0 of 5".

---

## Scenario 3: Hidden Results Modal & Evaluation Correction

**Goal**: Verify that scores remain hidden during play, can be opened on-demand, and host misclicks can be corrected.

1. In the game header, click the **View Results** button.
2. **Verify**:
   - The Results Modal opens over the game board without resetting game state.
   - The modal lists both players: `"David"` and `"Sarah"`.
   - Each player shows their total questions answered and total correct count.
   - Expanding a player shows the line-item list of card numbers, question prompts, and results (Correct / Incorrect).
3. In David's list, locate Card #5 which was previously evaluated as **Incorrect**.
4. Click on the evaluation badge to toggle it to **Correct**:
   - **Expected**: The badge immediately toggles to **Correct** (green).
   - David's total score increases by 1 dynamically without a page reload.
5. Click **Close** on the Results Modal:
   - **Expected**: Returns to the board with all disabled and active card states preserved.

---

## Scenario 4: Manual Board Reset (No Forced Winner Modal)

**Goal**: Verify that the host can conclude and restart the game on demand without a forced popup.

1. Re-open the **View Results** modal.
2. Click the **Reset Board** button.
3. Confirm the reset prompt.
4. **Expected**:
   - All 20 cards are reset to face-down active state.
   - All recorded player scores and round history are cleared.
   - The game prompts for the first player name of the new game.

---

## Scenario 5: Custom Questions & JSON Export/Import

**Goal**: Verify creating custom questions in `localStorage` and exporting/importing JSON question packs.

1. In the game configuration/settings, open **Custom Questions Manager**.
2. Click **Add Question**:
   - Select Type: **Option Selection**
   - Question: `"¿Quién fue el primer rey de Israel?"`
   - Options: `"A) David"`, `"B) Saúl"`, `"C) Salomón"`
   - Answer: `"B) Saúl"`
   - Language: `"es"`
   - Click **Save**.
3. **Verify**: The question is saved into browser `localStorage`.
4. Click **Export JSON**:
   - **Expected**: A file named `dynamo-card-qa-pack.json` downloads containing the question pack adhering to the contract schema in [data-model.md](file:///c:/projects/dinamo/dynamo/specs/005-card-qa-game/data-model.md).
5. Delete the question in the UI to test import.
6. Click **Import JSON** and select the downloaded file:
   - **Expected**: The question is successfully validated, imported, and rendered in the list.

---

## Scenario 6: Database Questions API & Offline Fallback

**Goal**: Verify that questions are fetched from the backend API, and falls back gracefully when offline.

1. Set Question Sourcing to **Database Questions**.
2. When backend is running:
   - Request `GET /api/games/card-qa/questions?language=es` returns 200 OK with pre-seeded Biblical questions.
3. Simulate offline condition (disconnect network or stop backend API server):
   - Start a match.
   - **Expected**: The board loads without crashing or throwing unhandled errors, pulling from the bundled offline fallback seeds (`card-qa-seeds.ts`).
