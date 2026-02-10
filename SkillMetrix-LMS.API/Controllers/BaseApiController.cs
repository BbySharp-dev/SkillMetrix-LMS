using Microsoft.AspNetCore.Mvc;

namespace SkillMetrix_LMS.API.Controllers;

/// <summary>
/// Base controller cung cấp helper methods chung cho tất cả Controllers
/// Tất cả Controllers nên kế thừa từ BaseApiController thay vì ControllerBase
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Helper method: Map ErrorType sang HTTP Status Code
    /// Dùng cho Result (void operations)
    /// </summary>
    protected IActionResult HandleError(Result result)
    {
        return result.ErrorType switch
        {
            ErrorType.NotFound => NotFound(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.ValidationError => BadRequest(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Unauthorized => Unauthorized(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Forbidden => StatusCode(403, new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Conflict => Conflict(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.BusinessRule => BadRequest(new ApiResponse<object>(result.ErrorMessage)),
            _ => StatusCode(500, new ApiResponse<object>(result.ErrorMessage))
        };
    }

    /// <summary>
    /// Helper method: Map ErrorType sang HTTP Status Code
    /// Dùng cho Result generic (operations có return value)
    /// </summary>
    protected IActionResult HandleError<T>(Result<T> result)
    {
        return result.ErrorType switch
        {
            ErrorType.NotFound => NotFound(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.ValidationError => BadRequest(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Unauthorized => Unauthorized(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Forbidden => StatusCode(403, new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.Conflict => Conflict(new ApiResponse<object>(result.ErrorMessage)),
            ErrorType.BusinessRule => BadRequest(new ApiResponse<object>(result.ErrorMessage)),
            _ => StatusCode(500, new ApiResponse<object>(result.ErrorMessage))
        };
    }
}