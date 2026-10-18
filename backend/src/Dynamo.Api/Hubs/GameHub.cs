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
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GameHub> _logger;

    public GameHub(SessionActorManager actorManager, IServiceScopeFactory scopeFactory, ILogger<GameHub> logger)
    {
        _actorManager = actorManager;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task JoinGameSession(string sessionId, string clientId)
    {
        Context.Items["SessionId"] = sessionId;
        Context.Items["ClientId"] = clientId;

        await Groups.AddToGroupAsync(Context.ConnectionId, $"Session_{sessionId}");

        string? mode = null;
        string? gameSlug = null;
        using (var scope = _scopeFactory.CreateScope())
        {
            var sessionRepo = scope.ServiceProvider.GetRequiredService<Dynamo.Core.Common.IRepository<Dynamo.Core.Entities.Session>>();
            if (Guid.TryParse(sessionId, out var sid))
            {
                var s = await sessionRepo.GetByIdAsync(sid);
                if (s != null)
                {
                    mode = s.Mode.ToString();
                    gameSlug = s.GameSlug;

                    _actorManager.RegisterPlayer(sessionId, clientId);
                    var actor = _actorManager.GetOrCreateActor(sessionId, mode, gameSlug);
                    if (actor is Dynamo.Application.Actors.BiblicalRouletteActor rouletteActor)
                    {
                        var phraseRepo = scope.ServiceProvider.GetRequiredService<Dynamo.Core.Common.IRepository<Dynamo.Core.Entities.Phrase>>();
                        var lang = s.Language ?? "es";
                        var phrases = await phraseRepo.FindAsync(p => p.Language == lang);
                        rouletteActor.InitializeMatch(s, phrases.ToList());
                    }
                    var snapshot = actor.GetSnapshot();

                    await Clients.Caller.ReceiveStateSnapshot(snapshot);
                    _logger.LogInformation("Client {ClientId} joined game session {SessionId}", clientId, sessionId);
                    return;
                }
            }
        }

        _actorManager.RegisterPlayer(sessionId, clientId);
        var defaultActor = _actorManager.GetOrCreateActor(sessionId, mode, gameSlug);
        var defaultSnapshot = defaultActor.GetSnapshot();

        await Clients.Caller.ReceiveStateSnapshot(defaultSnapshot);
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

    public Task SpinRoulette(string sessionId)
    {
        var clientId = GetCallerClientId();
        _actorManager.EnqueueIntent(sessionId, new PlayerIntent
        {
            ActionType = "SPIN_ROULETTE",
            ClientId = clientId,
            SessionId = sessionId,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
        return Task.CompletedTask;
    }

    public Task GuessConsonant(string sessionId, char letter)
    {
        var clientId = GetCallerClientId();
        _actorManager.EnqueueIntent(sessionId, new PlayerIntent
        {
            ActionType = "GUESS_CONSONANT",
            ClientId = clientId,
            SessionId = sessionId,
            Payload = letter,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
        return Task.CompletedTask;
    }

    public Task PurchaseVowel(string sessionId, char letter)
    {
        var clientId = GetCallerClientId();
        _actorManager.EnqueueIntent(sessionId, new PlayerIntent
        {
            ActionType = "PURCHASE_VOWEL",
            ClientId = clientId,
            SessionId = sessionId,
            Payload = letter,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
        return Task.CompletedTask;
    }

    public Task PurchaseHint(string sessionId)
    {
        var clientId = GetCallerClientId();
        _actorManager.EnqueueIntent(sessionId, new PlayerIntent
        {
            ActionType = "PURCHASE_HINT",
            ClientId = clientId,
            SessionId = sessionId,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
        return Task.CompletedTask;
    }

    public Task SolvePhrase(string sessionId, string phrase)
    {
        var clientId = GetCallerClientId();
        _actorManager.EnqueueIntent(sessionId, new PlayerIntent
        {
            ActionType = "SOLVE_PHRASE",
            ClientId = clientId,
            SessionId = sessionId,
            Payload = phrase,
            Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        });
        return Task.CompletedTask;
    }

    private string GetCallerClientId()
    {
        if (Context.Items.TryGetValue("ClientId", out var cid) && cid is string clientStr)
        {
            return clientStr;
        }
        return string.Empty;
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
