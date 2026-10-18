using Dynamo.Application.Phrases.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Dynamo.Api.Controllers;

public class PhrasesController : BaseController
{
    private readonly IGetPhrasesQueryHandler _getPhrasesHandler;

    public PhrasesController(IGetPhrasesQueryHandler getPhrasesHandler)
    {
        _getPhrasesHandler = getPhrasesHandler;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PhraseDto>>> GetPhrases(
        [FromQuery] string? language = null,
        CancellationToken cancellationToken = default)
    {
        var phrases = await _getPhrasesHandler.HandleAsync(language, cancellationToken);
        return Ok(phrases);
    }
}
