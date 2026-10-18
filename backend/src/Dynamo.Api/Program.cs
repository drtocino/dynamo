using Dynamo.Api.Hubs;
using Dynamo.Api.Services;
using Dynamo.Application.Games.Queries;
using Dynamo.Application.Phrases.Queries;
using Dynamo.Application.Services;
using Dynamo.Application.Sessions.Commands;
using Dynamo.Application.Sessions.Queries;
using Dynamo.Core.Common;
using Dynamo.Infrastructure.Data;
using Dynamo.Infrastructure.Workers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS for frontend Angular app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure EF Core DbContext (In-Memory for development and testing)
builder.Services.AddDbContext<DynamoDbContext>(options =>
{
    options.UseInMemoryDatabase("DynamoDb");
});

// Register Repository dependencies
builder.Services.AddScoped(typeof(IRepository<>), typeof(EfRepository<>));

// Register Application Handlers
builder.Services.AddScoped<IGetGamesQueryHandler, GetGamesQueryHandler>();
builder.Services.AddScoped<IGetPhrasesQueryHandler, GetPhrasesQueryHandler>();
builder.Services.AddScoped<ICreateSessionCommandHandler, CreateSessionCommandHandler>();
builder.Services.AddScoped<ICreateSharedScreenSessionCommandHandler, CreateSharedScreenSessionCommandHandler>();
builder.Services.AddScoped<IJoinSessionCommandHandler, JoinSessionCommandHandler>();
builder.Services.AddScoped<IGetSessionByCodeQueryHandler, GetSessionByCodeQueryHandler>();
builder.Services.AddScoped<IChangeSessionStateCommandHandler, ChangeSessionStateCommandHandler>();
builder.Services.AddScoped<ILeaveSessionCommandHandler, LeaveSessionCommandHandler>();

// Register Background Worker
builder.Services.AddHostedService<SessionCleanupWorker>();

// Register SignalR for real-time multiplayer updates
builder.Services.AddSignalR();

// Register Game Engine Services
builder.Services.AddSingleton<IGameStateBroadcaster, GameStateBroadcaster>();
builder.Services.AddSingleton<SessionActorManager>(sp =>
{
    var broadcaster = sp.GetRequiredService<IGameStateBroadcaster>();
    var scopeFactory = sp.GetRequiredService<IServiceScopeFactory>();
    var config = sp.GetRequiredService<IConfiguration>();
    var defaultLang = config["App:DefaultLanguage"] ?? "es";

    return new SessionActorManager(broadcaster, sessionId =>
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var phraseRepo = scope.ServiceProvider.GetRequiredService<Dynamo.Core.Common.IRepository<Dynamo.Core.Entities.Phrase>>();
            var sessionRepo = scope.ServiceProvider.GetRequiredService<Dynamo.Core.Common.IRepository<Dynamo.Core.Entities.Session>>();

            string lang = defaultLang;
            if (Guid.TryParse(sessionId, out var sid))
            {
                var session = sessionRepo.GetByIdAsync(sid).GetAwaiter().GetResult();
                if (session != null && !string.IsNullOrWhiteSpace(session.Language))
                {
                    lang = session.Language;
                }
            }

            var phrases = phraseRepo.FindAsync(p => p.Language == lang).GetAwaiter().GetResult();
            return phrases.ToList();
        }
        catch
        {
            return new List<Dynamo.Core.Entities.Phrase>();
        }
    });
});

var app = builder.Build();

// Ensure database and seed data created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DynamoDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapHub<SessionHub>("/hubs/session");
app.MapHub<GameHub>("/hub/game");

app.Run();
