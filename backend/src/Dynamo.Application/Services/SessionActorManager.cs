using System.Collections.Concurrent;
using Dynamo.Core.Models;

namespace Dynamo.Application.Services;

public class SessionActorManager : IAsyncDisposable
{
    private readonly ConcurrentDictionary<string, SessionActor> _actors = new();
    private readonly IGameStateBroadcaster _broadcaster;

    public SessionActorManager(IGameStateBroadcaster broadcaster)
    {
        _broadcaster = broadcaster;
    }

    public SessionActor GetOrCreateActor(string sessionId)
    {
        return _actors.GetOrAdd(sessionId, id =>
        {
            var actor = new SessionActor(id, _broadcaster);
            actor.Start();
            return actor;
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
