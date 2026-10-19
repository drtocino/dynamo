using System.Linq.Expressions;
using System.Text.Json;
using Dynamo.Application.Games.CardQa.Queries;
using Dynamo.Core.Common;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Xunit;

namespace Dynamo.Application.Tests;

public class FakeCardQuestionRepository : IRepository<CardQuestion>
{
    private readonly List<CardQuestion> _questions;

    public FakeCardQuestionRepository(List<CardQuestion> questions)
    {
        _questions = questions;
    }

    public Task<IReadOnlyList<CardQuestion>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult<IReadOnlyList<CardQuestion>>(_questions);
    }

    public Task<T?> GetByIdAsync<T>(Guid id, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<CardQuestion?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = _questions.FirstOrDefault(q => q.Id == id);
        return Task.FromResult(item);
    }

    public Task<IReadOnlyList<CardQuestion>> FindAsync(Expression<Func<CardQuestion, bool>> predicate, CancellationToken cancellationToken = default)
    {
        var func = predicate.Compile();
        return Task.FromResult<IReadOnlyList<CardQuestion>>(_questions.Where(func).ToList());
    }

    public Task<CardQuestion> AddAsync(CardQuestion entity, CancellationToken cancellationToken = default)
    {
        _questions.Add(entity);
        return Task.FromResult(entity);
    }

    public Task UpdateAsync(CardQuestion entity, CancellationToken cancellationToken = default)
    {
        var idx = _questions.FindIndex(q => q.Id == entity.Id);
        if (idx >= 0) _questions[idx] = entity;
        return Task.CompletedTask;
    }

    public Task DeleteAsync(CardQuestion entity, CancellationToken cancellationToken = default)
    {
        _questions.RemoveAll(q => q.Id == entity.Id);
        return Task.CompletedTask;
    }
}

public class CardQaTests
{
    private List<CardQuestion> CreateSampleQuestions()
    {
        return new List<CardQuestion>
        {
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "¿En qué ciudad nació Jesús?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Nazaret", "B) Belén", "C) Jerusalén", "D) Jericó" }),
                Answer = "B) Belén (Mateo 2:1)",
                Language = "es"
            },
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "¿El arca de Noé tenía tres pisos?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = null,
                Answer = "Verdadero (Génesis 6:16)",
                Language = "es"
            },
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "¿Quién derrotó a Goliat?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = null,
                Answer = "David (1 Samuel 17:49)",
                Language = "es"
            },
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "In which city was Jesus born?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Nazareth", "B) Bethlehem", "C) Jerusalem", "D) Jericho" }),
                Answer = "B) Bethlehem (Matthew 2:1)",
                Language = "en"
            },
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "Who was the prophet swallowed by a great fish?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = null,
                Answer = "Jonah (Jonah 1:17)",
                Language = "en"
            }
        };
    }

    [Fact]
    public async Task HandleAsync_ShouldFilterByLanguage_Spanish()
    {
        // Arrange
        var repo = new FakeCardQuestionRepository(CreateSampleQuestions());
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var results = await handler.HandleAsync("es");

        // Assert
        Assert.NotNull(results);
        Assert.Equal(3, results.Count);
        Assert.All(results, q => Assert.Equal("es", q.Language));
    }

    [Fact]
    public async Task HandleAsync_ShouldFilterByLanguage_English()
    {
        // Arrange
        var repo = new FakeCardQuestionRepository(CreateSampleQuestions());
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var results = await handler.HandleAsync("en");

        // Assert
        Assert.NotNull(results);
        Assert.Equal(2, results.Count);
        Assert.All(results, q => Assert.Equal("en", q.Language));
    }

    [Fact]
    public async Task HandleAsync_ShouldDefaultToSpanish_WhenLanguageIsNullOrEmpty()
    {
        // Arrange
        var repo = new FakeCardQuestionRepository(CreateSampleQuestions());
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var resultsNull = await handler.HandleAsync(null);
        var resultsEmpty = await handler.HandleAsync("");

        // Assert
        Assert.Equal(3, resultsNull.Count);
        Assert.Equal(3, resultsEmpty.Count);
        Assert.All(resultsNull, q => Assert.Equal("es", q.Language));
    }

    [Fact]
    public async Task HandleAsync_ShouldRespectLimit()
    {
        // Arrange
        var repo = new FakeCardQuestionRepository(CreateSampleQuestions());
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var results = await handler.HandleAsync("es", limit: 2);

        // Assert
        Assert.Equal(2, results.Count);
    }

    [Fact]
    public async Task HandleAsync_ShouldMapQuestionPropertiesCorrectly()
    {
        // Arrange
        var repo = new FakeCardQuestionRepository(CreateSampleQuestions());
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var results = await handler.HandleAsync("es");
        var optionQuestion = results.First(q => q.Type == "option-selection");
        var trueFalseQuestion = results.First(q => q.Type == "true-false");
        var openQuestion = results.First(q => q.Type == "open-question");

        // Assert
        Assert.Equal("database", optionQuestion.Source);
        Assert.NotNull(optionQuestion.Options);
        Assert.Equal(4, optionQuestion.Options.Count);
        Assert.Contains("B) Belén", optionQuestion.Options);
        Assert.Equal("B) Belén (Mateo 2:1)", optionQuestion.Answer);

        Assert.Equal("true-false", trueFalseQuestion.Type);
        Assert.Null(trueFalseQuestion.Options);

        Assert.Equal("open-question", openQuestion.Type);
        Assert.Null(openQuestion.Options);
    }

    [Fact]
    public async Task HandleAsync_ShouldMapWildcardTypeCorrectly()
    {
        // Arrange
        var questions = new List<CardQuestion>
        {
            new CardQuestion
            {
                Id = Guid.NewGuid(),
                Text = "🌟 ¡COMODÍN DE AYUDA!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = null,
                Answer = "¡Ayuda concedida!",
                Language = "es"
            }
        };
        var repo = new FakeCardQuestionRepository(questions);
        var handler = new GetCardQuestionsQueryHandler(repo);

        // Act
        var results = await handler.HandleAsync("es");

        // Assert
        Assert.Single(results);
        Assert.Equal("wildcard", results[0].Type);
        Assert.Equal("database", results[0].Source);
    }
}
