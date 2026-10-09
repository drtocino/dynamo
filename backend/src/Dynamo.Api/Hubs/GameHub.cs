using Dynamo.Application.Services;
using Dynamo.Core.Models;
using Microsoft.AspNetCore.SignalR;

namespace Dynamo.Api.Hubs;

public interface IGameHubClient
{
    Task ReceiveStateDelta(StateDelta delta);
    Task ReceiveStateSnapshot(StateSnapshot snapshot);
    Task ReceiveSystemMessage(string messageType, object payload);
}

public class GameHub : Hub<IGameHubClient>
{
    private readonly SessionActorManager _actorManager;
    private readonly ILogger<GameHub> _logger;

    public GameHub(SessionActorManager actorManager, ILogger<GameHub> logger)
    {
        _actorManager = actorManager;
        _logger = logger;
    }

    public async Task JoinGameSession(string sessionId, string clientId)
    {
        Context.Items["SessionId"] = sessionId;
        Context.Items["ClientId"] = clientId;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"Session_{sessionId}");

        _actorManager.RegisterPlayer(sessionId, clientId);
        var actor = _actorManager.GetOrCreateActor(sessionId);
        var snapshot = actor.GetSnapshot();

        await Clients.Caller.ReceiveStateSnapshot(snapshot);
        _logger.LogInformation("Client {ClientId} joined game session {SessionId}", clientId, sessionId);
    }

    public async Task LeaveGameSession(string sessionId, string clientId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Session_{sessionId}");
        _actorManager.UnregisterPlayer(sessionId, clientId);
        _logger.LogInformation("Client {ClientId} left game session {SessionId}", clientId, sessionId);
    }

    public Task SubmitIntent(PlayerIntent intent)
    {
        if (string.IsNullOrEmpty(intent.SessionId))
        {
            if (Context.Items.TryGetValue("SessionId", out var sid) && sid is string sessionStr)
            {
                intent.SessionId = sessionStr;
            }
        }

        if (string.IsNullOrEmpty(intent.ClientId))
        {
            if (Context.Items.TryGetValue("ClientId", out var cid) && cid is string clientStr)
            {
                intent.ClientId = clientStr;
            }
        }

        if (!string.IsNullOrEmpty(intent.SessionId))
        {
            _actorManager.EnqueueIntent(intent.SessionId, intent);
        }

        return Task.CompletedTask;
    }

    public async Task RequestSnapshot(string sessionId)
    {
        var actor = _actorManager.GetActor(sessionId);
        if (actor != null)
        {
            var snapshot = actor.GetSnapshot();
            await Clients.Caller.ReceiveStateSnapshot(snapshot);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.Items.TryGetValue("SessionId", out var sid) && sid is string sessionId &&
            Context.Items.TryGetValue("ClientId", out var cid) && cid is string clientId)
        {
            _actorManager.UnregisterPlayer(sessionId, clientId);
            _logger.LogInformation("Client {ClientId} disconnected from game session {SessionId}", clientId, sessionId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
