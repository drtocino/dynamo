using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;

namespace Dynamo.Application.Sessions.Commands;

public class CreateSharedScreenSessionRequest
{
    public Guid GameId { get; set; }
    public Guid HostClientId { get; set; }
    public int MaxPlayers { get; set; } = 8;
    public int Rounds { get; set; } = 3;
    public int TimeLimitSeconds { get; set; } = 60;
    public string GameSettingsJson { get; set; } = "{}";
    public List<string> PlayerNames { get; set; } = new();
}

public interface ICreateSharedScreenSessionCommandHandler
{
    Task<SessionDto> HandleAsync(CreateSharedScreenSessionRequest request, CancellationToken cancellationToken = default);
}

public class CreateSharedScreenSessionCommandHandler : ICreateSharedScreenSessionCommandHandler
{
    private readonly IRepository<Session> _sessionRepository;
    private readonly IRepository<Game> _gameRepository;

    public CreateSharedScreenSessionCommandHandler(
        IRepository<Session> sessionRepository,
        IRepository<Game> gameRepository)
    {
        _sessionRepository = sessionRepository;
        _gameRepository = gameRepository;
    }

    public async Task<SessionDto> HandleAsync(CreateSharedScreenSessionRequest request, CancellationToken cancellationToken = default)
    {
        var game = await _gameRepository.GetByIdAsync(request.GameId, cancellationToken);
        if (game == null)
        {
            throw new ArgumentException($"Game with ID {request.GameId} was not found.");
        }

        var hostClientId = request.HostClientId == Guid.Empty ? Guid.NewGuid() : request.HostClientId;
        var roomCode = CreateSessionCommandHandler.GenerateRoomCode(5);

        var session = new Session
        {
            Id = Guid.NewGuid(),
            RoomCode = roomCode,
            GameId = game.Id,
            GameSlug = game.Slug,
            GameName = game.Name,
            HostClientId = hostClientId,
            Mode = MultiplayerMode.SharedScreen,
            State = SessionState.Lobby,
            MaxPlayers = request.MaxPlayers > 0 ? request.MaxPlayers : 8,
            Rounds = request.Rounds > 0 ? request.Rounds : 3,
            TimeLimitSeconds = request.TimeLimitSeconds > 0 ? request.TimeLimitSeconds : 60,
            GameSettingsJson = request.GameSettingsJson,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15),
            CreatedAt = DateTime.UtcNow
        };

        // Add host device client
        session.Clients.Add(new Client
        {
            Id = Guid.NewGuid(),
            ClientId = hostClientId,
            SessionId = session.Id,
            ConnectedAt = DateTime.UtcNow
        });

        // Bulk register local players on the single shared client
        int order = 0;
        foreach (var name in request.PlayerNames)
        {
            if (string.IsNullOrWhiteSpace(name)) continue;
            var player = new Player
            {
                Id = Guid.NewGuid(),
                SessionId = session.Id,
                ClientId = hostClientId,
                Name = name.Trim(),
                OrderIndex = order++
            };
            session.Players.Add(player);
        }

        if (session.Players.Any())
        {
            session.ActivePlayerId = session.Players.First().Id;
        }

        await _sessionRepository.AddAsync(session, cancellationToken);
        return CreateSessionCommandHandler.ToDto(session);
    }
}
