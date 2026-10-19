using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;

namespace Dynamo.Application.Sessions.Commands;

public class ChangeSessionStateRequest
{
    public SessionState State { get; set; }
}

public interface IChangeSessionStateCommandHandler
{
    Task<SessionDto> HandleAsync(Guid sessionId, SessionState newState, CancellationToken cancellationToken = default);
}

public class ChangeSessionStateCommandHandler : IChangeSessionStateCommandHandler
{
    private readonly IRepository<Session> _sessionRepository;

    public ChangeSessionStateCommandHandler(IRepository<Session> sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<SessionDto> HandleAsync(Guid sessionId, SessionState newState, CancellationToken cancellationToken = default)
    {
        var sessions = await _sessionRepository.FindAsync(s => s.Id == sessionId, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null)
        {
            throw new KeyNotFoundException($"Session {sessionId} not found.");
        }

        session.State = newState;
        if (session.Mode != MultiplayerMode.RoomBased)
        {
            session.ExpiresAt = DateTime.UtcNow.AddHours(24);
        }
        else if (newState == SessionState.Active)
        {
            session.ExpiresAt = DateTime.UtcNow.AddHours(2);
        }

        await _sessionRepository.UpdateAsync(session, cancellationToken);

        return CreateSessionCommandHandler.ToDto(session);
    }
}
