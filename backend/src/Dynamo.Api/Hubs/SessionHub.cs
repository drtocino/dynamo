using Microsoft.AspNetCore.SignalR;

namespace Dynamo.Api.Hubs;

public interface ISessionClient
{
    Task PlayerJoined(object player);
    Task PlayerLeft(object payload);
    Task SessionStateChanged(object payload);
    Task TurnAdvanced(object payload);
}

public class SessionHub : Hub<ISessionClient>
{
    public async Task JoinSessionRoom(string sessionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"session:{sessionId}");
    }

    public async Task LeaveSessionRoom(string sessionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"session:{sessionId}");
    }
}
