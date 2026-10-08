using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;

namespace Dynamo.Application.Sessions.Commands;

public class JoinSessionRequest
{
    public Guid ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
}

public interface IJoinSessionCommandHandler
{
    Task<PlayerDto> HandleAsync(Guid sessionId, JoinSessionRequest request, CancellationToken cancellationToken = default);
}

public class JoinSessionCommandHandler : IJoinSessionCommandHandler
{
    private readonly IRepository<Session> _sessionRepository;
    private readonly IRepository<Player> _playerRepository;
    private readonly IRepository<Client> _clientRepository;

    public JoinSessionCommandHandler(
        IRepository<Session> sessionRepository,
        IRepository<Player> playerRepository,
        IRepository<Client> clientRepository)
    {
        _sessionRepository = sessionRepository;
        _playerRepository = playerRepository;
        _clientRepository = clientRepository;
    }

    public async Task<PlayerDto> HandleAsync(Guid sessionId, JoinSessionRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Player name cannot be empty.");
        }

        var sessions = await _sessionRepository.FindAsync(s => s.Id == sessionId, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionId} not found.");
        }

        if (session.State != SessionState.Lobby && session.State != SessionState.Configuring)
        {
            throw new InvalidOperationException("Cannot join a session that is already active or ended.");
        }

        if (session.Players.Count >= session.MaxPlayers)
        {
            throw new InvalidOperationException($"Session has reached its maximum player limit of {session.MaxPlayers}.");
        }

        var clientId = request.ClientId == Guid.Empty ? Guid.NewGuid() : request.ClientId;

        // Register client if not already present
        if (!session.Clients.Any(c => c.Id == clientId))
        {
            var client = new Client
            {
                Id = clientId,
                SessionId = session.Id,
                ConnectedAt = DateTime.UtcNow
            };
            await _clientRepository.AddAsync(client, cancellationToken);
        }

        // Check if name is taken in this session, append number if needed
        var trimmedName = request.Name.Trim();
        var finalName = trimmedName;
        int count = 1;
        while (session.Players.Any(p => p.Name.Equals(finalName, StringComparison.OrdinalIgnoreCase)))
        {
            count++;
            finalName = $"{trimmedName} ({count})";
        }

        var player = new Player
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            ClientId = clientId,
            Name = finalName,
            OrderIndex = session.Players.Count
        };

        await _playerRepository.AddAsync(player, cancellationToken);

        // If this is the first player, designate as active player for shared screen
        if (session.ActivePlayerId == null)
        {
            session.ActivePlayerId = player.Id;
            await _sessionRepository.UpdateAsync(session, cancellationToken);
        }

        return new PlayerDto
        {
            Id = player.Id,
            SessionId = player.SessionId,
            ClientId = player.ClientId,
            Name = player.Name,
            OrderIndex = player.OrderIndex
        };
    }
}
