using Dynamo.Application.Games.CardQa.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Dynamo.Api.Controllers;

[ApiController]
[Route("api/games/card-qa/questions")]
[Route("api/v1/games/card-qa/questions")]
public class CardQuestionsController : ControllerBase
{
    private readonly IGetCardQuestionsQueryHandler _handler;

    public CardQuestionsController(IGetCardQuestionsQueryHandler handler)
    {
        _handler = handler;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CardQuestionDto>>> GetQuestions(
        [FromQuery] string? language = "es",
        [FromQuery] int? limit = 50,
        CancellationToken cancellationToken = default)
    {
        var questions = await _handler.HandleAsync(language, limit, cancellationToken);
        return Ok(questions);
    }
}
