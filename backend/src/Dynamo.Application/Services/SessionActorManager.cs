using System.Collections.Concurrent;
using Dynamo.Application.Actors;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Dynamo.Core.Models;

namespace Dynamo.Application.Services;

public class SessionActorManager : IAsyncDisposable
{
    private readonly ConcurrentDictionary<string, SessionActor> _actors = new();
    private readonly IGameStateBroadcaster _broadcaster;
    private readonly Func<string, List<Phrase>>? _phraseProvider;

    public SessionActorManager(IGameStateBroadcaster broadcaster, Func<string, List<Phrase>>? phraseProvider = null)
    {
        _broadcaster = broadcaster;
        _phraseProvider = phraseProvider;
    }

    public SessionActor GetOrCreateActor(string sessionId, string? mode = null, string? gameSlug = null, List<Phrase>? phrases = null)
    {
        bool isBiblicalRoulette = string.Equals(mode, "BiblicalRoulette", StringComparison.OrdinalIgnoreCase)
            || string.Equals(gameSlug, "biblical-roulette", StringComparison.OrdinalIgnoreCase);

        return _actors.AddOrUpdate(
            sessionId,
            id =>
            {
                SessionActor actor = isBiblicalRoulette
                    ? new BiblicalRouletteActor(id, _broadcaster, phrases ?? _phraseProvider?.Invoke(id))
                    : new SessionActor(id, _broadcaster);
                actor.Start();
                return actor;
            },
            (id, existing) =>
            {
                if (isBiblicalRoulette && existing is not BiblicalRouletteActor)
                {
                    var rouletteActor = new BiblicalRouletteActor(id, _broadcaster, phrases ?? _phraseProvider?.Invoke(id));
                    foreach (var p in existing.CurrentState.Players.Values)
                    {
                        rouletteActor.RegisterPlayer(p.ClientId);
                    }
                    _ = existing.DisposeAsync();
                    rouletteActor.Start();
                    return rouletteActor;
                }
                return existing;
            });
    }

    public SessionActor? GetActor(string sessionId)
    {
        _actors.TryGetValue(sessionId, out var actor);
        return actor;
    }

    public bool EnqueueIntent(string sessionId, PlayerIntent intent)
    {
        var actor = GetOrCreateActor(sessionId);
        return actor.EnqueueIntent(intent);
    }

    public void RegisterPlayer(string sessionId, string clientId)
    {
        var actor = GetOrCreateActor(sessionId);
        actor.RegisterPlayer(clientId);
    }

    public void UnregisterPlayer(string sessionId, string clientId)
    {
        if (_actors.TryGetValue(sessionId, out var actor))
        {
            actor.UnregisterPlayer(clientId);
        }
    }

    public async Task StopActorAsync(string sessionId)
    {
        if (_actors.TryRemove(sessionId, out var actor))
        {
            await actor.DisposeAsync();
        }
    }

    public async ValueTask DisposeAsync()
    {
        foreach (var actor in _actors.Values)
        {
            await actor.DisposeAsync();
        }
        _actors.Clear();
    }
}
