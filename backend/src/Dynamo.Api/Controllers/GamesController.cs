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
    public async Task<ActionResult<IReadOnlyList<GameDto>>> GetGames(CancellationToken cancellationToken)
    {
        var games = await _getGamesHandler.HandleAsync(cancellationToken);
        return Ok(games);
    }
}
