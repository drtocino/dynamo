using Dynamo.Core.Common;
using Dynamo.Core.Enums;

namespace Dynamo.Core.Entities;

public class Session : BaseEntity
{
    public string RoomCode { get; set; } = string.Empty;
    public Guid GameId { get; set; }
    public string GameSlug { get; set; } = string.Empty;
    public string GameName { get; set; } = string.Empty;
    public Guid HostClientId { get; set; }
    public MultiplayerMode Mode { get; set; } = MultiplayerMode.RoomBased;
    public SessionState State { get; set; } = SessionState.Configuring;

    // Configurable Settings
    public int MaxPlayers { get; set; } = 8;
    public int Rounds { get; set; } = 3;
    public int TimeLimitSeconds { get; set; } = 60;
    public string GameSettingsJson { get; set; } = "{}";
    public string Language { get; set; } = "es";

    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(15);

    // Turn tracking (SharedScreen)
    public Guid? ActivePlayerId { get; set; }

    public List<Client> Clients { get; set; } = new();
    public List<Player> Players { get; set; } = new();
}
