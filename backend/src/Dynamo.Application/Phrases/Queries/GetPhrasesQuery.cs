using Dynamo.Core.Common;
using Dynamo.Core.Entities;

namespace Dynamo.Application.Phrases.Queries;

public class PhraseDto
{
    public Guid Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public string GeneralHint { get; set; } = string.Empty;
    public string SpecificHint { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string Language { get; set; } = "es";
}

public interface IGetPhrasesQueryHandler
{
    Task<IReadOnlyList<PhraseDto>> HandleAsync(string? language = null, CancellationToken cancellationToken = default);
}

public class GetPhrasesQueryHandler : IGetPhrasesQueryHandler
{
    private readonly IRepository<Phrase> _phraseRepository;

    public GetPhrasesQueryHandler(IRepository<Phrase> phraseRepository)
    {
        _phraseRepository = phraseRepository;
    }

    public async Task<IReadOnlyList<PhraseDto>> HandleAsync(string? language = null, CancellationToken cancellationToken = default)
    {
        var phrases = await _phraseRepository.GetAllAsync(cancellationToken);
        if (!string.IsNullOrWhiteSpace(language))
        {
            phrases = phrases.Where(p => string.Equals(p.Language, language, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return phrases.Select(p => new PhraseDto
        {
            Id = p.Id,
            Text = p.Text,
            GeneralHint = p.GeneralHint,
            SpecificHint = p.SpecificHint,
            Category = p.Category,
            Language = p.Language
        }).ToList();
    }
}
