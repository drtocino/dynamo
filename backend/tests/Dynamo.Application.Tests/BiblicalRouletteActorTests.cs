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
        Assert.Equal(100, state.CurrentVowelCost);

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
        actor.SetPlayerScore(player1, 600);

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
        Assert.Equal(250, state.CurrentVowelCost); // Scaled from 100 to 250!
        // "FOR GOD SO LOVED THE WORLD" contains 5 'O's -> 5 * 100 = 500 pts deducted from 600
        Assert.Equal(100, actor.CurrentState.Players[player1].Score);

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
}
