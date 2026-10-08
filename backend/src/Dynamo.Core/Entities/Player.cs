using Dynamo.Core.Common;

namespace Dynamo.Core.Entities;

public class Player : BaseEntity
{
    public Guid SessionId { get; set; }
    public Guid ClientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
}
