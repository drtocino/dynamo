using Dynamo.Application.Games.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Dynamo.Api.Controllers;

public class GamesController : BaseController
{
    private readonly IGetGamesQueryHandler _getGamesHandler;

    public GamesController(IGetGamesQueryHandler getGamesHandler)
    {
        _getGamesHandler = getGamesHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GameDto>>> GetGames(
        [FromQuery] string? language = null, 
        CancellationToken cancellationToken = default)
    {
        var games = await _getGamesHandler.HandleAsync(language, cancellationToken);
        return Ok(games);
    }
}
