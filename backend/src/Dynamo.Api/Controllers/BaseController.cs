using Microsoft.AspNetCore.Mvc;

namespace Dynamo.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseController : ControllerBase
{
}
