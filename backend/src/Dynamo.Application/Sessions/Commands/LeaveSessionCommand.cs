using Dynamo.Core.Common;
using Dynamo.Core.Entities;

namespace Dynamo.Application.Sessions.Commands;

public interface ILeaveSessionCommandHandler
{
    Task<SessionDto?> HandleAsync(Guid sessionId, Guid clientId, Guid? playerId, CancellationToken cancellationToken = default);
}

public class LeaveSessionCommandHandler : ILeaveSessionCommandHandler
{
    private readonly IRepository<Session> _sessionRepository;
    private readonly IRepository<Player> _playerRepository;
    private readonly IRepository<Client> _clientRepository;

    public LeaveSessionCommandHandler(
        IRepository<Session> sessionRepository,
        IRepository<Player> playerRepository,
        IRepository<Client> clientRepository)
    {
        _sessionRepository = sessionRepository;
        _playerRepository = playerRepository;
        _clientRepository = clientRepository;
    }

    public async Task<SessionDto?> HandleAsync(Guid sessionId, Guid clientId, Guid? playerId, CancellationToken cancellationToken = default)
    {
        var sessions = await _sessionRepository.FindAsync(s => s.Id == sessionId, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null) return null;

        // Remove player if specified or matches client
        if (playerId.HasValue)
        {
            var p = session.Players.FirstOrDefault(x => x.Id == playerId.Value);
            if (p != null)
            {
                await _playerRepository.DeleteAsync(p, cancellationToken);
            }
        }
        else
        {
            var playersToRemove = session.Players.Where(x => x.ClientId == clientId).ToList();
            foreach (var p in playersToRemove)
            {
                await _playerRepository.DeleteAsync(p, cancellationToken);
            }
        }

        // Remove client
        var c = session.Clients.FirstOrDefault(x => x.Id == clientId);
        if (c != null)
        {
            await _clientRepository.DeleteAsync(c, cancellationToken);
        }

        // Host transfer logic on creator departure (FR-019)
        if (session.HostClientId == clientId)
        {
            var remainingClient = session.Clients.Where(x => x.Id != clientId).OrderBy(x => x.ConnectedAt).FirstOrDefault();
            if (remainingClient != null)
            {
                session.HostClientId = remainingClient.Id;
            }
            else
            {
                var remainingPlayer = session.Players.FirstOrDefault(x => x.ClientId != clientId);
                if (remainingPlayer != null)
                {
                    session.HostClientId = remainingPlayer.ClientId;
                }
            }
        }

        await _sessionRepository.UpdateAsync(session, cancellationToken);
        return CreateSessionCommandHandler.ToDto(session);
    }
}
