using Dynamo.Core.Common;
using Dynamo.Core.Entities;

namespace Dynamo.Application.Games.Queries;

public class GameDto
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ThumbnailUrl { get; set; } = string.Empty;
    public List<string> SupportedModes { get; set; } = new();
    public string SettingsSchemaJson { get; set; } = "{}";
}

public interface IGetGamesQueryHandler
{
    Task<IReadOnlyList<GameDto>> HandleAsync(CancellationToken cancellationToken = default);
}

public class GetGamesQueryHandler : IGetGamesQueryHandler
{
    private readonly IRepository<Game> _gameRepository;

    public GetGamesQueryHandler(IRepository<Game> gameRepository)
    {
        _gameRepository = gameRepository;
    }

    public async Task<IReadOnlyList<GameDto>> HandleAsync(CancellationToken cancellationToken = default)
    {
        var games = await _gameRepository.GetAllAsync(cancellationToken);
        return games.Select(g => new GameDto
        {
            Id = g.Id,
            Slug = g.Slug,
            Name = g.Name,
            Description = g.Description,
            ThumbnailUrl = g.ThumbnailUrl,
            SupportedModes = g.SupportedModes.Select(m => m.ToString()).ToList(),
            SettingsSchemaJson = g.SettingsSchemaJson
        }).ToList();
    }
}
