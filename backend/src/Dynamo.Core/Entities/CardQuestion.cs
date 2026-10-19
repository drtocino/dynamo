using Dynamo.Core.Common;
using Dynamo.Core.Enums;

namespace Dynamo.Core.Entities;

public class CardQuestion : BaseEntity
{
    public string Text { get; set; } = string.Empty;
    public CardQuestionType Type { get; set; }
    public string? OptionsJson { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string Language { get; set; } = "es";
}
