using Dynamo.Api.Hubs;
using Dynamo.Application.Services;
using Dynamo.Core.Models;
using Microsoft.AspNetCore.SignalR;

namespace Dynamo.Api.Services;

public class GameStateBroadcaster : IGameStateBroadcaster
{
    private readonly IHubContext<GameHub, IGameHubClient> _hubContext;

    public GameStateBroadcaster(IHubContext<GameHub, IGameHubClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task BroadcastDeltaAsync(string sessionId, StateDelta delta)
    {
        return _hubContext.Clients.Group($"Session_{sessionId}").ReceiveStateDelta(delta);
    }

    public Task BroadcastSnapshotAsync(string sessionId, StateSnapshot snapshot)
    {
        return _hubContext.Clients.Group($"Session_{sessionId}").ReceiveStateSnapshot(snapshot);
    }
}
