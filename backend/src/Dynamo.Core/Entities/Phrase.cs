using Dynamo.Core.Common;

namespace Dynamo.Core.Entities;

public class Phrase : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public string GeneralHint { get; set; } = string.Empty;
    public string SpecificHint { get; set; } = string.Empty;
    public string? Category { get; set; }
}
