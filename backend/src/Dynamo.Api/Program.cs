using Dynamo.Api.Hubs;
using Dynamo.Application.Games.Queries;
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

app.Run();
