using Dynamo.Application.Sessions.Commands;
using Dynamo.Core.Common;
using Dynamo.Core.Entities;

namespace Dynamo.Application.Sessions.Queries;

public interface IGetSessionByCodeQueryHandler
{
    Task<SessionDto?> HandleAsync(string roomCode, CancellationToken cancellationToken = default);
}

public class GetSessionByCodeQueryHandler : IGetSessionByCodeQueryHandler
{
    private readonly IRepository<Session> _sessionRepository;

    public GetSessionByCodeQueryHandler(IRepository<Session> sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<SessionDto?> HandleAsync(string roomCode, CancellationToken cancellationToken = default)
    {
        var normalizedCode = roomCode.Trim().ToUpperInvariant();
        var sessions = await _sessionRepository.FindAsync(s => s.RoomCode == normalizedCode, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null) return null;

        return CreateSessionCommandHandler.ToDto(session);
    }
}
