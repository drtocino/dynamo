using System.Text.Json.Serialization;

namespace Dynamo.Core.Models;

public class GameState
{
    [JsonPropertyName("sequenceNumber")]
    public long SequenceNumber { get; set; }

    [JsonPropertyName("sessionId")]
    public string SessionId { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Lobby"; // Lobby | Starting | InProgress | Finished

    [JsonPropertyName("serverTimeMs")]
    public long ServerTimeMs { get; set; }

    [JsonPropertyName("players")]
    public Dictionary<string, PlayerState> Players { get; set; } = new();

    [JsonPropertyName("payload")]
    public object? Payload { get; set; }
}

public class PlayerState
{
    [JsonPropertyName("clientId")]
    public string ClientId { get; set; } = string.Empty;

    [JsonPropertyName("score")]
    public int Score { get; set; }

    [JsonPropertyName("isConnected")]
    public bool IsConnected { get; set; } = true;

    [JsonPropertyName("lastAcknowledgedInputSequence")]
    public long LastAcknowledgedInputSequence { get; set; }
}

public class PlayerIntent
{
    [JsonPropertyName("inputSequence")]
    public long InputSequence { get; set; }

    [JsonPropertyName("clientId")]
    public string ClientId { get; set; } = string.Empty;

    [JsonPropertyName("sessionId")]
    public string SessionId { get; set; } = string.Empty;

    [JsonPropertyName("timestamp")]
    public long Timestamp { get; set; }

    [JsonPropertyName("actionType")]
    public string ActionType { get; set; } = string.Empty;

    [JsonPropertyName("payload")]
    public object? Payload { get; set; }
}

public class StateSnapshot
{
    [JsonPropertyName("sequenceNumber")]
    public long SequenceNumber { get; set; }

    [JsonPropertyName("fullState")]
    public GameState FullState { get; set; } = new();
}

public class StateDelta
{
    [JsonPropertyName("sequenceNumber")]
    public long SequenceNumber { get; set; }

    [JsonPropertyName("patch")]
    public object? Patch { get; set; }
}
