using Dynamo.Api.Hubs;
using Dynamo.Application.Sessions.Commands;
using Dynamo.Application.Sessions.Queries;
using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Dynamo.Api.Controllers;

public class SessionsController : BaseController
{
    private readonly ICreateSessionCommandHandler _createSessionHandler;
    private readonly ICreateSharedScreenSessionCommandHandler _createSharedScreenHandler;
    private readonly IJoinSessionCommandHandler _joinSessionHandler;
    private readonly IGetSessionByCodeQueryHandler _getSessionByCodeHandler;
    private readonly IChangeSessionStateCommandHandler _changeSessionStateHandler;
    private readonly ILeaveSessionCommandHandler _leaveSessionHandler;
    private readonly IRepository<Session> _sessionRepository;
    private readonly IRepository<Phrase> _phraseRepository;
    private readonly IHubContext<SessionHub, ISessionClient> _hubContext;
    private readonly Dynamo.Application.Services.SessionActorManager _actorManager;

    public SessionsController(
        ICreateSessionCommandHandler createSessionHandler,
        ICreateSharedScreenSessionCommandHandler createSharedScreenHandler,
        IJoinSessionCommandHandler joinSessionHandler,
        IGetSessionByCodeQueryHandler getSessionByCodeHandler,
        IChangeSessionStateCommandHandler changeSessionStateHandler,
        ILeaveSessionCommandHandler leaveSessionHandler,
        IRepository<Session> sessionRepository,
        IRepository<Phrase> phraseRepository,
        IHubContext<SessionHub, ISessionClient> hubContext,
        Dynamo.Application.Services.SessionActorManager actorManager)
    {
        _createSessionHandler = createSessionHandler;
        _createSharedScreenHandler = createSharedScreenHandler;
        _joinSessionHandler = joinSessionHandler;
        _getSessionByCodeHandler = getSessionByCodeHandler;
        _changeSessionStateHandler = changeSessionStateHandler;
        _leaveSessionHandler = leaveSessionHandler;
        _sessionRepository = sessionRepository;
        _phraseRepository = phraseRepository;
        _hubContext = hubContext;
        _actorManager = actorManager;
    }

    [HttpPost]
    public async Task<ActionResult<SessionDto>> CreateSession([FromBody] CreateSessionRequest request, CancellationToken cancellationToken)
    {
        var session = await _createSessionHandler.HandleAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetSessionById), new { id = session.Id }, session);
    }

    [HttpPost("shared-screen")]
    public async Task<ActionResult<SessionDto>> CreateSharedScreenSession([FromBody] CreateSharedScreenSessionRequest request, CancellationToken cancellationToken)
    {
        var session = await _createSharedScreenHandler.HandleAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetSessionById), new { id = session.Id }, session);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SessionDto>> GetSessionById(Guid id, CancellationToken cancellationToken)
    {
        var sessions = await _sessionRepository.FindAsync(s => s.Id == id, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null) return NotFound(new { message = $"Session {id} was not found." });

        return Ok(CreateSessionCommandHandler.ToDto(session));
    }

    [HttpGet("code/{code}")]
    public async Task<ActionResult<SessionDto>> GetSessionByCode(string code, CancellationToken cancellationToken)
    {
        var session = await _getSessionByCodeHandler.HandleAsync(code, cancellationToken);
        if (session == null) return NotFound(new { message = $"Session with code '{code}' was not found or has expired." });

        return Ok(session);
    }

    [HttpPost("{id}/players")]
    public async Task<ActionResult<PlayerDto>> JoinSession(Guid id, [FromBody] JoinSessionRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var player = await _joinSessionHandler.HandleAsync(id, request, cancellationToken);

            // Synchronize with Authoritative Session Actor
            _actorManager.RegisterPlayer(id.ToString(), request.ClientId.ToString());

            // Broadcast real-time event to session group
            await _hubContext.Clients.Group($"session:{id}").PlayerJoined(player);

            return Ok(player);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/players/{playerId}")]
    public async Task<ActionResult<SessionDto>> LeaveSession(Guid id, Guid playerId, [FromQuery] Guid clientId, CancellationToken cancellationToken)
    {
        var updatedSession = await _leaveSessionHandler.HandleAsync(id, clientId, playerId, cancellationToken);
        if (updatedSession == null) return NotFound(new { message = $"Session {id} was not found." });

        _actorManager.UnregisterPlayer(id.ToString(), clientId.ToString());

        // Broadcast PlayerLeft
        await _hubContext.Clients.Group($"session:{id}").PlayerLeft(new { playerId, newHostClientId = updatedSession.HostClientId });

        return Ok(updatedSession);
    }

    [HttpPut("{id}/state")]
    public async Task<ActionResult<SessionDto>> ChangeState(Guid id, [FromBody] ChangeSessionStateRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _changeSessionStateHandler.HandleAsync(id, request.State, cancellationToken);

            if (request.State == SessionState.Active)
            {
                var actor = _actorManager.GetOrCreateActor(id.ToString(), updated.Mode, updated.GameSlug);
                if (actor is Dynamo.Application.Actors.BiblicalRouletteActor rouletteActor)
                {
                    var sessions = await _sessionRepository.FindAsync(s => s.Id == id, cancellationToken);
                    var sessionEntity = sessions.FirstOrDefault();
                    var lang = sessionEntity?.Language ?? "es";
                    IEnumerable<Dynamo.Core.Entities.Phrase> phrases = await _phraseRepository.FindAsync(p => p.Language == lang, cancellationToken);

                    if (!string.IsNullOrWhiteSpace(sessionEntity?.GameSettingsJson))
                    {
                        try
                        {
                            using var doc = System.Text.Json.JsonDocument.Parse(sessionEntity.GameSettingsJson);
                            if (doc.RootElement.TryGetProperty("customPhrase", out var cpElem))
                            {
                                var cp = System.Text.Json.JsonSerializer.Deserialize<Dynamo.Core.Entities.Phrase>(cpElem.GetRawText(), new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                                if (cp != null)
                                {
                                    phrases = new List<Dynamo.Core.Entities.Phrase> { cp };
                                }
                            }
                        }
                        catch
                        {
                            // fallback to repository phrases
                        }
                    }

                    rouletteActor.InitializeMatch(sessionEntity, phrases.ToList());
                }
                actor.Start();
            }
            else if (request.State == SessionState.Ended)
            {
                _ = _actorManager.StopActorAsync(id.ToString());
            }

            // Broadcast SessionStateChanged with string state value
            await _hubContext.Clients.Group($"session:{id}").SessionStateChanged(new { state = updated.State.ToString() });

            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/turn/advance")]
    public async Task<ActionResult<SessionDto>> AdvanceTurn(Guid id, CancellationToken cancellationToken)
    {
        var sessions = await _sessionRepository.FindAsync(s => s.Id == id, cancellationToken);
        var session = sessions.FirstOrDefault();
        if (session == null) return NotFound();

        if (session.Players.Count > 0)
        {
            var currentIndex = session.Players.FindIndex(p => p.Id == session.ActivePlayerId);
            var nextIndex = (currentIndex + 1) % session.Players.Count;
            session.ActivePlayerId = session.Players[nextIndex].Id;
            await _sessionRepository.UpdateAsync(session, cancellationToken);

            await _hubContext.Clients.Group($"session:{id}").TurnAdvanced(new { activePlayerId = session.ActivePlayerId });
        }

        return Ok(CreateSessionCommandHandler.ToDto(session));
    }
}
