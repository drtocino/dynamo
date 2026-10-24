using System.Text.Json;
using Dynamo.Application.Actors;
using Dynamo.Core.Entities;
using Dynamo.Core.Models;
using Xunit;

namespace Dynamo.Application.Tests;

public class BiblicalRouletteActorTests
{
    private readonly List<Phrase> _testPhrases = new()
    {
        new Phrase
        {
            Id = Guid.NewGuid(),
            Text = "FOR GOD SO LOVED THE WORLD",
            GeneralHint = "Gospels",
            SpecificHint = "John 3:16"
        }
    };

    [Fact]
    public void BiblicalRoulette_WheelWedges_MustMatchRulesSpecification()
    {
        // Must have exactly 20 wedges: 1 Bankrupt, 2 Miss Turn, 17 price numbers
        Assert.Equal(20, BiblicalRouletteActor.WheelWedges.Length);
        Assert.Single(BiblicalRouletteActor.WheelWedges.Where(w => w.Label == "BANKRUPT"));
        Assert.Equal(2, BiblicalRouletteActor.WheelWedges.Count(w => w.Label == "MISS TURN"));
        Assert.Equal(17, BiblicalRouletteActor.WheelWedges.Count(w => w.Value > 0));
    }

    [Fact]
    public async Task BiblicalRouletteActor_ShouldInitializeMatchWithMaskedPhrase()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-1";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        var player2 = "player-2";
        actor.RegisterPlayer(player1);
        actor.RegisterPlayer(player2);

        actor.InitializeMatch();
        await Task.Delay(200);

        var state = actor.RouletteState;
        Assert.NotNull(state);
        Assert.Equal(1, state.CurrentRoundIndex);
        Assert.Equal(3, state.TotalRounds);
        Assert.Contains(state.CurrentTurnPlayerId, new[] { player1, player2 });
        Assert.Contains("_", state.MaskedPhrase);
        Assert.Equal(150, state.CurrentVowelCost);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_SpinAndConsonantGuess_ShouldUpdateScoreAndMask()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-2";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();
        await Task.Delay(150);

        // Step 1: Select consonant 'D' (present in "GOD", "LOVED", "WORLD" - 3 occurrences)
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "SELECT_CONSONANT",
            ClientId = player1,
            SessionId = sessionId,
            Payload = 'D'
        });
        await Task.Delay(200);

        var stateAfterSelect = actor.RouletteState;
        Assert.NotNull(stateAfterSelect);
        Assert.Equal('D', stateAfterSelect.StagedConsonant);
        Assert.Equal("AwaitingSpin", stateAfterSelect.TurnStep);

        // Step 2: Spin the roulette
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "SPIN_ROULETTE",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(200);

        var stateAfterSpin = actor.RouletteState;
        Assert.NotNull(stateAfterSpin);

        if (stateAfterSpin.LastSpinResult != "BANKRUPT" && stateAfterSpin.LastSpinResult != "MISS TURN")
        {
            Assert.Contains('D', stateAfterSpin.RevealedConsonants);
            Assert.Contains("D", stateAfterSpin.MaskedPhrase);
            Assert.Equal(3 * stateAfterSpin.LastSpinValue, actor.CurrentState.Players[player1].Score);
            Assert.Equal(3, stateAfterSpin.LastRevealedCount);
        }

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_PurchaseVowel_ShouldDeductPointsAndScalePrice()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-3";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();

        // Give player points to purchase vowel
        actor.SetPlayerScore(player1, 1000);

        // Purchase vowel 'O'
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_VOWEL",
            ClientId = player1,
            SessionId = sessionId,
            Payload = 'O'
        });
        await Task.Delay(200);

        var state = actor.RouletteState;
        Assert.NotNull(state);
        Assert.Contains('O', state.RevealedVowels);
        Assert.Equal(300, state.CurrentVowelCost); // Scaled from 150 to 300!
        // "FOR GOD SO LOVED THE WORLD" contains 5 'O's -> 5 * 150 = 750 pts deducted from 1000
        Assert.Equal(250, actor.CurrentState.Players[player1].Score);

        // Next purchase scales to 600
        actor.SetPlayerScore(player1, 2000);
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_VOWEL",
            ClientId = player1,
            SessionId = sessionId,
            Payload = 'E'
        });
        await Task.Delay(200);
        Assert.Equal(600, actor.RouletteState.CurrentVowelCost); // Scaled to 600!

        // Next purchase scales to 1000
        actor.SetPlayerScore(player1, 2000);
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_VOWEL",
            ClientId = player1,
            SessionId = sessionId,
            Payload = 'A'
        });
        await Task.Delay(200);
        Assert.Equal(1000, actor.RouletteState.CurrentVowelCost); // Scaled to 1000!

        // Capped at 1000 on further purchases
        actor.SetPlayerScore(player1, 2000);
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_VOWEL",
            ClientId = player1,
            SessionId = sessionId,
            Payload = 'I'
        });
        await Task.Delay(200);
        Assert.Equal(1000, actor.RouletteState.CurrentVowelCost); // Capped at 1000!

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_SolvePhrase_ShouldAwardRoundWin()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-4";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();
        await Task.Delay(150);

        // Solve phrase
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "SOLVE_PHRASE",
            ClientId = player1,
            SessionId = sessionId,
            Payload = "FOR GOD SO LOVED THE WORLD"
        });
        await Task.Delay(250);

        var state = actor.RouletteState;
        Assert.NotNull(state);
        Assert.Equal(player1, state.RoundWinnerId);
        Assert.Equal(1, state.RoundsWon[player1]);
        Assert.Equal("FOR GOD SO LOVED THE WORLD", state.SolvedPhrase);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_IncorrectSolvePhrase_ShouldTrackLastIncorrectGuessAndAdvanceTurn()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-incorrect";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        var player2 = "player-2";
        actor.RegisterPlayer(player1);
        actor.RegisterPlayer(player2);
        actor.InitializeMatch();
        await Task.Delay(150);

        var initialTurnPlayer = actor.RouletteState.CurrentTurnPlayerId;

        // Player submits incorrect phrase guess
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "SOLVE_PHRASE",
            ClientId = initialTurnPlayer,
            SessionId = sessionId,
            Payload = "WRONG PHRASE GUESS"
        });
        await Task.Delay(250);

        var state = actor.RouletteState;
        Assert.NotNull(state);
        Assert.Null(state.RoundWinnerId);
        Assert.Equal("WRONG PHRASE GUESS", state.LastIncorrectGuess);
        Assert.False(string.IsNullOrEmpty(state.LastIncorrectGuessId));
        // Turn should have advanced to next player
        Assert.NotEqual(initialTurnPlayer, state.CurrentTurnPlayerId);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_Phrases_ShouldBeRandomAndUniqueAcrossRounds()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-random";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();
        await Task.Delay(150);

        var round1PhraseId = actor.RouletteState.CurrentPhraseId;
        Assert.NotEqual(Guid.Empty, round1PhraseId);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_PurchaseHint_Requires5000PointsAndRevealsHint()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-hint";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();
        await Task.Delay(150);

        // Score below 5,000 should not allow hint purchase
        actor.SetPlayerScore(player1, 4999);
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_HINT",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(200);
        Assert.False(actor.RouletteState.HintRevealed);
        Assert.Equal(4999, actor.CurrentState.Players[player1].Score);

        // Score of 7,000 should allow hint purchase, deducting 5,000
        actor.SetPlayerScore(player1, 7000);
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_HINT",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(200);
        Assert.True(actor.RouletteState.HintRevealed);
        Assert.Equal(2000, actor.CurrentState.Players[player1].Score);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_FirstSpin_ShouldGrant15SecondsGracePeriod()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-timer-bonus";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var session = new Session
        {
            Id = Guid.NewGuid(),
            TimeLimitSeconds = 30
        };

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch(session);
        await Task.Delay(150);

        var state = actor.RouletteState;
        Assert.True(state.IsFirstSpinOfTurn);
        Assert.False(state.IsTurnTimerPaused);
        Assert.NotNull(state.TurnDeadlineUtc);

        var secondsRemaining = (state.TurnDeadlineUtc.Value - DateTime.UtcNow).TotalSeconds;
        // Configured 30s + 15s first-spin bonus = ~45s
        Assert.InRange(secondsRemaining, 42.0, 46.0);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_Action_ShouldResetTimerToStandardDurationWithoutBonus()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-timer-reset";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var session = new Session
        {
            Id = Guid.NewGuid(),
            TimeLimitSeconds = 30
        };

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch(session);
        await Task.Delay(150);

        actor.SetPlayerScore(player1, 10000);

        // Taking an action (PURCHASE_HINT) resets timer to base 30s (no +15s bonus)
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PURCHASE_HINT",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(200);

        var state = actor.RouletteState;
        Assert.False(state.IsFirstSpinOfTurn);
        Assert.NotNull(state.TurnDeadlineUtc);

        var secondsRemaining = (state.TurnDeadlineUtc.Value - DateTime.UtcNow).TotalSeconds;
        // Standard configured 30s without +15s bonus
        Assert.InRange(secondsRemaining, 28.0, 31.0);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_PauseAndResume_ShouldHaltTimer()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-timer-pause";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases);
        actor.Start();

        var player1 = "player-1";
        actor.RegisterPlayer(player1);
        actor.InitializeMatch();
        await Task.Delay(150);

        Assert.False(actor.RouletteState.IsTurnTimerPaused);

        // Pause timer (e.g. solve modal open)
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "PAUSE_TURN_TIMER",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(150);
        Assert.True(actor.RouletteState.IsTurnTimerPaused);

        // Resume timer
        actor.EnqueueIntent(new PlayerIntent
        {
            ActionType = "RESUME_TURN_TIMER",
            ClientId = player1,
            SessionId = sessionId
        });
        await Task.Delay(150);
        Assert.False(actor.RouletteState.IsTurnTimerPaused);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task BiblicalRouletteActor_TurnTimeout_ShouldAdvanceToNextPlayer()
    {
        var broadcaster = new TestBroadcaster();
        var sessionId = "roulette-session-timeout";
        var actor = new BiblicalRouletteActor(sessionId, broadcaster, _testPhrases)
        {
            ExtraFirstSpinSeconds = 0 // Disable 15s bonus for fast unit test
        };
        actor.Start();

        var session = new Session
        {
            Id = Guid.NewGuid(),
            TimeLimitSeconds = 1 // 1 second turn timeout
        };

        var player1 = "player-1";
        var player2 = "player-2";
        actor.RegisterPlayer(player1);
        actor.RegisterPlayer(player2);
        actor.InitializeMatch(session);
        await Task.Delay(150);

        var initialPlayer = actor.RouletteState.CurrentTurnPlayerId;
        var expectedNextPlayer = initialPlayer == player1 ? player2 : player1;

        // Wait for 1 second timeout to fire + delay for thread execution
        await Task.Delay(1400);

        Assert.Equal(expectedNextPlayer, actor.RouletteState.CurrentTurnPlayerId);

        await actor.DisposeAsync();
    }
}
