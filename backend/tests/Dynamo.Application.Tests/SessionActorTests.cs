using Dynamo.Application.Services;
using Dynamo.Core.Models;
using Xunit;

namespace Dynamo.Application.Tests;

public class TestBroadcaster : IGameStateBroadcaster
{
    public List<StateDelta> BroadcastedDeltas { get; } = new();
    public List<StateSnapshot> BroadcastedSnapshots { get; } = new();

    public Task BroadcastDeltaAsync(string sessionId, StateDelta delta)
    {
        BroadcastedDeltas.Add(delta);
        return Task.CompletedTask;
    }

    public Task BroadcastSnapshotAsync(string sessionId, StateSnapshot snapshot)
    {
        BroadcastedSnapshots.Add(snapshot);
        return Task.CompletedTask;
    }
}

public class SessionActorTests
{
    [Fact]
    public async Task SessionActor_ShouldApplyPlayerIntentAndIncrementSequence()
    {
        // Arrange
        var broadcaster = new TestBroadcaster();
        var sessionId = "test-session-123";
        var actor = new SessionActor(sessionId, broadcaster);
        actor.Start();

        var clientId = "player-client-1";
        actor.RegisterPlayer(clientId);

        var intent = new PlayerIntent
        {
            InputSequence = 1,
            ClientId = clientId,
            SessionId = sessionId,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ActionType = "BUZZ_IN"
        };

        // Act
        actor.EnqueueIntent(intent);

        // Wait for at least 2 ticks (100ms each)
        await Task.Delay(250);

        var snapshot = actor.GetSnapshot();

        // Assert
        Assert.NotNull(snapshot.FullState);
        Assert.True(snapshot.SequenceNumber > 0);
        Assert.True(snapshot.FullState.Players.ContainsKey(clientId));
        Assert.Equal(10, snapshot.FullState.Players[clientId].Score);
        Assert.Equal(1, snapshot.FullState.Players[clientId].LastAcknowledgedInputSequence);

        await actor.DisposeAsync();
    }

    [Fact]
    public async Task SessionActorManager_ShouldRouteIntentToActor()
    {
        // Arrange
        var broadcaster = new TestBroadcaster();
        var manager = new SessionActorManager(broadcaster);
        var sessionId = "session-manager-test";
        var clientId = "client-xyz";

        manager.RegisterPlayer(sessionId, clientId);

        var intent = new PlayerIntent
        {
            InputSequence = 42,
            ClientId = clientId,
            SessionId = sessionId,
            ActionType = "ANSWER_SELECTED"
        };

        // Act
        var success = manager.EnqueueIntent(sessionId, intent);
        Assert.True(success);

        await Task.Delay(250);

        var actor = manager.GetActor(sessionId);
        Assert.NotNull(actor);

        var snapshot = actor.GetSnapshot();
        Assert.Equal(20, snapshot.FullState.Players[clientId].Score);
        Assert.Equal(42, snapshot.FullState.Players[clientId].LastAcknowledgedInputSequence);

        await manager.DisposeAsync();
    }
}
