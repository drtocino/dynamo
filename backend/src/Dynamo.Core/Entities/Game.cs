using Dynamo.Core.Common;
using Dynamo.Core.Enums;

namespace Dynamo.Core.Entities;

public class Game : BaseEntity
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public List<MultiplayerMode> SupportedModes { get; set; } = new();
    public string SettingsSchemaJson { get; set; } = "{}";
    public string Language { get; set; } = "es";
}
