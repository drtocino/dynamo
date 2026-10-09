using Dynamo.Application.Games.Queries;
using Dynamo.Application.Sessions.Commands;
using Dynamo.Application.Sessions.Queries;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Dynamo.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Dynamo.Application.Tests;

public class SessionLifecycleTests
{
    private DynamoDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<DynamoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var context = new DynamoDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    [Fact]
    public async Task GetGamesQuery_ReturnsConfiguredMockGames()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var handler = new GetGamesQueryHandler(gameRepo);

        var result = await handler.HandleAsync();

        Assert.NotEmpty(result);
        Assert.Contains(result, g => g.Slug == "trivia-pro");
        Assert.Contains(result, g => g.Slug == "charades-flash");
    }

    [Fact]
    public async Task CreateSession_GeneratesValidRoomCode_AndInitializesLobby()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);

        var games = await gameRepo.GetAllAsync();
        var selectedGame = games.First();

        var handler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var hostId = Guid.NewGuid();

        var request = new CreateSessionRequest
        {
            GameId = selectedGame.Id,
            Mode = MultiplayerMode.RoomBased,
            HostClientId = hostId,
            MaxPlayers = 6,
            Rounds = 3,
            TimeLimitSeconds = 45
        };

        var sessionDto = await handler.HandleAsync(request);

        Assert.NotNull(sessionDto);
        Assert.Equal(5, sessionDto.RoomCode.Length);
        Assert.Equal("Lobby", sessionDto.State);
        Assert.Equal(hostId, sessionDto.HostClientId);
        Assert.Equal(6, sessionDto.MaxPlayers);
    }

    [Fact]
    public async Task JoinSession_AddsPlayer_Successfully()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);
        var playerRepo = new EfRepository<Player>(context);
        var clientRepo = new EfRepository<Client>(context);

        var games = await gameRepo.GetAllAsync();
        var createHandler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var session = await createHandler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id,
            MaxPlayers = 4
        });

        var joinHandler = new JoinSessionCommandHandler(sessionRepo, playerRepo, clientRepo);
        var playerDto = await joinHandler.HandleAsync(session.Id, new JoinSessionRequest
        {
            Name = "Grace",
            ClientId = Guid.NewGuid()
        });

        Assert.Equal("Grace", playerDto.Name);

        var updatedSession = await sessionRepo.GetByIdAsync(session.Id);
        Assert.Single(updatedSession!.Players);
    }

    [Fact]
    public async Task JoinSession_ThrowsException_WhenCapacityReached()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);
        var playerRepo = new EfRepository<Player>(context);
        var clientRepo = new EfRepository<Client>(context);

        var games = await gameRepo.GetAllAsync();
        var createHandler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var session = await createHandler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id,
            MaxPlayers = 1
        });

        var joinHandler = new JoinSessionCommandHandler(sessionRepo, playerRepo, clientRepo);
        await joinHandler.HandleAsync(session.Id, new JoinSessionRequest
        {
            Name = "Player 1",
            ClientId = Guid.NewGuid()
        });

        // Joining when max reached must fail
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            joinHandler.HandleAsync(session.Id, new JoinSessionRequest
            {
                Name = "Player 2",
                ClientId = Guid.NewGuid()
            })
        );
    }

    [Fact]
    public async Task ChangeSessionState_TransitionsToActive_AndReturnsToLobby()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);

        var games = await gameRepo.GetAllAsync();
        var createHandler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var session = await createHandler.HandleAsync(new CreateSessionRequest { GameId = games.First().Id });

        var stateHandler = new ChangeSessionStateCommandHandler(sessionRepo);

        // Start match
        var activeSession = await stateHandler.HandleAsync(session.Id, SessionState.Active);
        Assert.Equal("Active", activeSession.State);

        // Rematch: conclude and return to lobby
        var lobbySession = await stateHandler.HandleAsync(session.Id, SessionState.Lobby);
        Assert.Equal("Lobby", lobbySession.State);
    }

    [Fact]
    public async Task LeaveSession_TransfersHost_WhenHostDeparts()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);
        var playerRepo = new EfRepository<Player>(context);
        var clientRepo = new EfRepository<Client>(context);

        var games = await gameRepo.GetAllAsync();
        var hostClientId = Guid.NewGuid();
        var guestClientId = Guid.NewGuid();

        var createHandler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var session = await createHandler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id,
            HostClientId = hostClientId
        });

        var joinHandler = new JoinSessionCommandHandler(sessionRepo, playerRepo, clientRepo);
        var hostPlayer = await joinHandler.HandleAsync(session.Id, new JoinSessionRequest
        {
            Name = "Host User",
            ClientId = hostClientId
        });

        var guestPlayer = await joinHandler.HandleAsync(session.Id, new JoinSessionRequest
        {
            Name = "Guest User",
            ClientId = guestClientId
        });

        // Host departs
        var leaveHandler = new LeaveSessionCommandHandler(sessionRepo, playerRepo, clientRepo);
        var afterLeave = await leaveHandler.HandleAsync(session.Id, hostClientId, hostPlayer.Id);

        Assert.NotNull(afterLeave);
        // Host should be transferred to guest (FR-019)
        Assert.Equal(guestClientId, afterLeave.HostClientId);
        Assert.Single(afterLeave.Players);
        Assert.Equal("Guest User", afterLeave.Players[0].Name);
    }

    [Fact]
    public async Task CreateSharedScreenSession_RegistersAllLocalPlayers()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);

        var games = await gameRepo.GetAllAsync();
        var hostClientId = Guid.NewGuid();

        var handler = new CreateSharedScreenSessionCommandHandler(sessionRepo, gameRepo);
        var sessionDto = await handler.HandleAsync(new CreateSharedScreenSessionRequest
        {
            GameId = games.First().Id,
            HostClientId = hostClientId,
            PlayerNames = new List<string> { "Team Alpha", "Team Beta", "Team Gamma" }
        });

        Assert.Equal("SharedScreen", sessionDto.Mode);
        Assert.Equal(3, sessionDto.Players.Count);
        Assert.Equal("Team Alpha", sessionDto.Players[0].Name);
        Assert.NotNull(sessionDto.ActivePlayerId);
    }

    [Fact]
    public async Task CreateSession_AllowsSameHostToCreateMultipleSessions_WithoutKeyCollision()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);

        var games = await gameRepo.GetAllAsync();
        var handler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var persistentClientId = Guid.NewGuid();

        // First session creation
        var session1 = await handler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id,
            HostClientId = persistentClientId
        });

        // Second session creation with exact same HostClientId (verifies fix for duplicate key ArgumentException)
        var session2 = await handler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id,
            HostClientId = persistentClientId
        });

        Assert.NotNull(session1);
        Assert.NotNull(session2);
        Assert.NotEqual(session1.Id, session2.Id);
        Assert.Equal(persistentClientId, session1.HostClientId);
        Assert.Equal(persistentClientId, session2.HostClientId);
    }

    [Fact]
    public async Task JoinSession_AllowsSameClientToJoinMultipleSessions_WithoutKeyCollision()
    {
        using var context = CreateInMemoryDbContext();
        var gameRepo = new EfRepository<Game>(context);
        var sessionRepo = new EfRepository<Session>(context);
        var playerRepo = new EfRepository<Player>(context);
        var clientRepo = new EfRepository<Client>(context);

        var games = await gameRepo.GetAllAsync();
        var createHandler = new CreateSessionCommandHandler(sessionRepo, gameRepo);
        var joinHandler = new JoinSessionCommandHandler(sessionRepo, playerRepo, clientRepo);

        var guestClientId = Guid.NewGuid();

        var session1 = await createHandler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id
        });
        var session2 = await createHandler.HandleAsync(new CreateSessionRequest
        {
            GameId = games.First().Id
        });

        var player1 = await joinHandler.HandleAsync(session1.Id, new JoinSessionRequest
        {
            ClientId = guestClientId,
            Name = "Guest User"
        });

        var player2 = await joinHandler.HandleAsync(session2.Id, new JoinSessionRequest
        {
            ClientId = guestClientId,
            Name = "Guest User"
        });

        Assert.NotNull(player1);
        Assert.NotNull(player2);
        Assert.NotEqual(player1.Id, player2.Id);
        Assert.Equal(guestClientId, player1.ClientId);
        Assert.Equal(guestClientId, player2.ClientId);
    }
}
