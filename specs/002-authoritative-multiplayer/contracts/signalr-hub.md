# SignalR Hub Contracts

The `GameHub` serves as the bridge between the Angular clients and the .NET Session Actors.

## Hub Connections & Groups

- **Route**: `/hub/game`
- **Connection**: Clients connect and pass their `ClientId`.
- **Groups**: Clients are added to a SignalR Group named `Session_{SessionId}` upon joining a game.

## Client-to-Server Messages (Invoked by Angular)

```csharp
public interface IGameHubClientMethods
{
    // Sent by the client to submit an input/action.
    // The Hub captures this, identifies the SessionId, and enqueues it to the corresponding Session Actor.
    Task SubmitIntent(PlayerIntent intent);
    
    // Explicit request to catch up (e.g., after reconnection)
    Task RequestSnapshot(string sessionId);
}
```

## Server-to-Client Messages (Listened by Angular)

```csharp
public interface IGameHubServerMethods
{
    // Broadcasted by the Session Actor loop at a fixed frequency (e.g., 10Hz)
    Task ReceiveStateDelta(StateDelta delta);
    
    // Broadcasted on major phase changes, or when explicitly requested by a client catching up
    Task ReceiveStateSnapshot(StateSnapshot snapshot);
    
    // System message (e.g., "Session Closed", "Reconnecting")
    Task ReceiveSystemMessage(string messageType, object payload);
}
```
