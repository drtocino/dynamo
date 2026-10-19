using System.Text.Json;
using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;

namespace Dynamo.Application.Games.CardQa.Queries;

public class CardQuestionDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public List<string>? Options { get; set; }
    public string Answer { get; set; } = string.Empty;
    public string Language { get; set; } = "es";
    public string Source { get; set; } = "database";
}

public interface IGetCardQuestionsQueryHandler
{
    Task<IReadOnlyList<CardQuestionDto>> HandleAsync(string? language = null, int? limit = null, CancellationToken cancellationToken = default);
}

public class GetCardQuestionsQueryHandler : IGetCardQuestionsQueryHandler
{
    private readonly IRepository<CardQuestion> _cardQuestionRepository;

    public GetCardQuestionsQueryHandler(IRepository<CardQuestion> cardQuestionRepository)
    {
        _cardQuestionRepository = cardQuestionRepository;
    }

    public async Task<IReadOnlyList<CardQuestionDto>> HandleAsync(string? language = null, int? limit = null, CancellationToken cancellationToken = default)
    {
        var questions = await _cardQuestionRepository.GetAllAsync(cancellationToken);

        var targetLanguage = string.IsNullOrWhiteSpace(language) ? "es" : language.Trim().ToLowerInvariant();

        var filtered = questions
            .Where(q => string.Equals(q.Language, targetLanguage, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var maxCount = (limit.HasValue && limit.Value > 0) ? limit.Value : 50;
        var selected = filtered.Take(maxCount).ToList();

        return selected.Select(q => new CardQuestionDto
        {
            Id = q.Id,
            Text = q.Text,
            Type = MapTypeToString(q.Type),
            Options = DeserializeOptions(q.OptionsJson),
            Answer = q.Answer,
            Language = q.Language,
            Source = "database"
        }).ToList();
    }

    private static string MapTypeToString(CardQuestionType type) => type switch
    {
        CardQuestionType.TrueFalse => "true-false",
        CardQuestionType.OptionSelection => "option-selection",
        CardQuestionType.OpenQuestion => "open-question",
        CardQuestionType.Wildcard => "wildcard",
        _ => "open-question"
    };

    private static List<string>? DeserializeOptions(string? optionsJson)
    {
        if (string.IsNullOrWhiteSpace(optionsJson))
        {
            return null;
        }

        try
        {
            return JsonSerializer.Deserialize<List<string>>(optionsJson);
        }
        catch
        {
            return null;
        }
    }
}
