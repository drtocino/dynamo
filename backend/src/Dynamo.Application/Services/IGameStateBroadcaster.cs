using Dynamo.Core.Models;

namespace Dynamo.Application.Services;

public interface IGameStateBroadcaster
{
    Task BroadcastDeltaAsync(string sessionId, StateDelta delta);
    Task BroadcastSnapshotAsync(string sessionId, StateSnapshot snapshot);
}
