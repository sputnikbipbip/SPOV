using Microsoft.AspNetCore.Mvc;
using SPOV.Domain.Common;

namespace SPOV.WebApi.Extensions;

public static class ResultExtensions
{
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return new OkObjectResult(result.Data);

        return result.Error!.Type switch
        {
            ErrorType.NotFound => new NotFoundObjectResult(new { error = result.Error.Description }),
            ErrorType.Validation => new BadRequestObjectResult(new { error = result.Error.Description }),
            ErrorType.Conflict => new ConflictObjectResult(new { error = result.Error.Description }),
            ErrorType.Unauthorized => new UnauthorizedObjectResult(new { error = result.Error.Description }),
            _ => new ObjectResult(new { error = result.Error.Description }) { StatusCode = 500 }
        };
    }

    public static IActionResult ToActionResult(this Result result)
    {
        if (result.IsSuccess)
            return new OkResult();

        return result.Error!.Type switch
        {
            ErrorType.NotFound => new NotFoundObjectResult(new { error = result.Error.Description }),
            ErrorType.Validation => new BadRequestObjectResult(new { error = result.Error.Description }),
            ErrorType.Conflict => new ConflictObjectResult(new { error = result.Error.Description }),
            ErrorType.Unauthorized => new UnauthorizedObjectResult(new { error = result.Error.Description }),
            _ => new ObjectResult(new { error = result.Error.Description }) { StatusCode = 500 }
        };
    }
}
