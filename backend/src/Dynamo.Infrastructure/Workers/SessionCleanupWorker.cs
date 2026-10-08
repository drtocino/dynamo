using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Dynamo.Infrastructure.Workers;

public class SessionCleanupWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SessionCleanupWorker> _logger;

    public SessionCleanupWorker(IServiceProvider serviceProvider, ILogger<SessionCleanupWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Session cleanup background worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var sessionRepo = scope.ServiceProvider.GetRequiredService<IRepository<Session>>();

                var now = DateTime.UtcNow;
                var expiredSessions = await sessionRepo.FindAsync(s => s.ExpiresAt < now && s.State != SessionState.Ended, stoppingToken);

                foreach (var session in expiredSessions)
                {
                    _logger.LogInformation("Expiring idle session {SessionId} with code {RoomCode}", session.Id, session.RoomCode);
                    session.State = SessionState.Ended;
                    await sessionRepo.UpdateAsync(session, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during session cleanup execution.");
            }

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
