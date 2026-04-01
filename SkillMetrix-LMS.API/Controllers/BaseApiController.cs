using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Controllers;

/// <summary>
/// Base controller cung cấp helper methods chung cho tất cả Controllers.
/// Tất cả Controllers nên kế thừa từ BaseApiController thay vì ControllerBase.
/// </summary>
[ApiController]
public abstract class BaseApiController : ControllerBase
{
    // ─── Auth Helpers ─────────────────────────────────────────────────────────

    /// <summary>
    /// Lấy UserId của user đang đăng nhập từ JWT claim.
    /// </summary>
    /// <returns>
    /// <c>Guid</c> nếu claim hợp lệ.
    /// <c>null</c> nếu token không có claim hoặc không parse được.
    /// </returns>
    protected Guid? GetCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var userId) ? userId : null;
    }

    /// <summary>
    /// Lấy Role của user đang đăng nhập từ JWT claim.
    /// </summary>
    /// <returns>
    /// Chuỗi role (vd: "Admin", "Instructor", "Student").
    /// <c>null</c> nếu không có claim.
    /// </returns>
    protected string? GetCurrentUserRole()
        => User.FindFirstValue(ClaimTypes.Role);

    // ─── Error Handlers ───────────────────────────────────────────────────────

    /// <summary>
    /// Map <see cref="ErrorType"/> sang HTTP Status Code tương ứng.
    /// Dùng cho <see cref="Result"/> (void operations - không có return value).
    /// </summary>
    protected IActionResult HandleError(Result result)
        => MapErrorToResponse(result.ErrorType, result.ErrorMessage);

    /// <summary>
    /// Map <see cref="ErrorType"/> sang HTTP Status Code tương ứng.
    /// Dùng cho <see cref="Result{T}"/> (operations có return value).
    /// </summary>
    protected IActionResult HandleError<T>(Result<T> result)
        => MapErrorToResponse(result.ErrorType, result.ErrorMessage);

    // ─── Private ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Logic map ErrorType → HTTP response dùng chung cho cả 2 overload HandleError.
    /// </summary>
    private IActionResult MapErrorToResponse(ErrorType errorType, string message)
        => errorType switch
        {
            ErrorType.NotFound => NotFound(new ApiResponse<object>(message)),
            ErrorType.ValidationError => BadRequest(new ApiResponse<object>(message)),         // 400
            ErrorType.Unauthorized => Unauthorized(new ApiResponse<object>(message)),        // 401
            ErrorType.Forbidden => StatusCode(403, new ApiResponse<object>(message)),     // 403
            ErrorType.Conflict => Conflict(new ApiResponse<object>(message)),            // 409
            ErrorType.BusinessRule => UnprocessableEntity(new ApiResponse<object>(message)), // 422 
            _ => StatusCode(500, new ApiResponse<object>(message))      // 500
        };
}