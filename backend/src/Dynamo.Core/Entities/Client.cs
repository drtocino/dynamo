using Dynamo.Core.Common;

namespace Dynamo.Core.Entities;

public class Client : BaseEntity
{
    public Guid ClientId { get; set; }
    public Guid SessionId { get; set; }
    public DateTime ConnectedAt { get; set; } = DateTime.UtcNow;
}
