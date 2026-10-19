using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using System.Security.Cryptography;

namespace Dynamo.Application.Sessions.Commands;

public class CreateSessionRequest
{
    public Guid GameId { get; set; }
    public MultiplayerMode Mode { get; set; } = MultiplayerMode.RoomBased;
    public Guid HostClientId { get; set; }
    public int MaxPlayers { get; set; } = 8;
    public int Rounds { get; set; } = 3;
    public int TimeLimitSeconds { get; set; } = 60;
    public string GameSettingsJson { get; set; } = "{}";
    public string Language { get; set; } = "es";
}

public class SessionDto
{
    public Guid Id { get; set; }
    public string RoomCode { get; set; } = string.Empty;
    public Guid GameId { get; set; }
    public string GameSlug { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public Guid HostClientId { get; set; }
    public string Mode { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public int MaxPlayers { get; set; }
    public int Rounds { get; set; }
    public int TimeLimitSeconds { get; set; }
    public string GameSettingsJson { get; set; } = "{}";
    public string Language { get; set; } = "es";
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid? ActivePlayerId { get; set; }
    public List<PlayerDto> Players { get; set; } = new();
}

public class PlayerDto
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}

public interface ICreateSessionCommandHandler
{
    Task<SessionDto> HandleAsync(CreateSessionRequest request, CancellationToken cancellationToken = default);
}

public class CreateSessionCommandHandler : ICreateSessionCommandHandler
{
    private readonly IRepository<Session> _sessionRepository;
    private readonly IRepository<Game> _gameRepository;
    private static readonly char[] CodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray();

    public CreateSessionCommandHandler(
        IRepository<Session> sessionRepository,
        IRepository<Game> gameRepository)
    {
        _sessionRepository = sessionRepository;
        _gameRepository = gameRepository;
    }

    public async Task<SessionDto> HandleAsync(CreateSessionRequest request, CancellationToken cancellationToken = default)
    {
        var game = await _gameRepository.GetByIdAsync(request.GameId, cancellationToken);
        if (game == null)
        {
            throw new ArgumentException($"Game with ID {request.GameId} was not found.");
        }

        // Generate unique 5-character Room Code
        var roomCode = GenerateRoomCode(5);

        var hostClientId = request.HostClientId == Guid.Empty ? Guid.NewGuid() : request.HostClientId;

        var session = new Session
        {
            Id = Guid.NewGuid(),
            RoomCode = roomCode,
            GameId = game.Id,
            GameSlug = game.Slug,
            GameName = game.Name,
            HostClientId = hostClientId,
            Mode = request.Mode,
            State = SessionState.Lobby,
            MaxPlayers = request.MaxPlayers > 0 ? request.MaxPlayers : 8,
            Rounds = request.Rounds > 0 ? request.Rounds : 3,
            TimeLimitSeconds = request.TimeLimitSeconds > 0 ? request.TimeLimitSeconds : 60,
            GameSettingsJson = request.GameSettingsJson,
            Language = string.IsNullOrWhiteSpace(request.Language) ? (game.Language ?? "es") : request.Language,
            ExpiresAt = request.Mode == MultiplayerMode.RoomBased 
                ? DateTime.UtcNow.AddHours(2) 
                : DateTime.UtcNow.AddHours(24),
            CreatedAt = DateTime.UtcNow
        };

        // Add creator client
        session.Clients.Add(new Client
        {
            Id = Guid.NewGuid(),
            ClientId = hostClientId,
            SessionId = session.Id,
            ConnectedAt = DateTime.UtcNow
        });

        await _sessionRepository.AddAsync(session, cancellationToken);

        return ToDto(session);
    }

    public static string GenerateRoomCode(int length = 5)
    {
        var buffer = new byte[length];
        RandomNumberGenerator.Fill(buffer);
        var result = new char[length];
        for (int i = 0; i < length; i++)
        {
            result[i] = CodeCharacters[buffer[i] % CodeCharacters.Length];
        }
        return new string(result);
    }

    public static SessionDto ToDto(Session session)
    {
        return new SessionDto
        {
            Id = session.Id,
            RoomCode = session.RoomCode,
            GameId = session.GameId,
            GameSlug = session.GameSlug,
            GameName = session.GameName,
            HostClientId = session.HostClientId,
            Mode = session.Mode.ToString(),
            State = session.State.ToString(),
            MaxPlayers = session.MaxPlayers,
            Rounds = session.Rounds,
            TimeLimitSeconds = session.TimeLimitSeconds,
            GameSettingsJson = session.GameSettingsJson,
            Language = session.Language ?? "es",
            CreatedAt = session.CreatedAt,
            ExpiresAt = session.ExpiresAt,
            ActivePlayerId = session.ActivePlayerId,
            Players = session.Players.Select(p => new PlayerDto
            {
                Id = p.Id,
                SessionId = p.SessionId,
                ClientId = p.ClientId,
                Name = p.Name,
                OrderIndex = p.OrderIndex
            }).OrderBy(p => p.OrderIndex).ToList()
        };
    }
}
