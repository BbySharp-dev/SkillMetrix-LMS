using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Courses;
using SkillMetrix_LMS.API.Features.Courses.DTOs;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Features.Enrollments;

/// <summary>
/// Controller quản lý đăng ký khóa học (Enrollment).
/// Tất cả endpoint yêu cầu xác thực JWT.
/// </summary>
[Route("api/enrollments")]
public class EnrollmentsController : BaseApiController
{
    private readonly IEnrollmentService _enrollmentService;

    public EnrollmentsController(IEnrollmentService enrollmentService)
    {
        _enrollmentService = enrollmentService;
    }

    // ─── Private helper ───────────────────────────────────────────

    /// <summary>
    /// Lấy UserId từ JWT claim.
    /// Trả về <c>null</c> nếu token không hợp lệ hoặc thiếu claim.
    /// </summary>
    private new Guid? GetCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(raw, out var userId) ? userId : null;
    }

    // ─── Endpoints ────────────────────────────────────────────────

    /// <summary>
    /// Đăng ký khóa học cho user hiện tại.
    /// </summary>
    /// <param name="dto">Thông tin đăng ký: CourseId, PaymentMethod (nếu có), CouponCode (nếu có).</param>
    /// <returns>Thông tin enrollment vừa tạo kèm transaction nếu có phí.</returns>
    /// <response code="200">Đăng ký thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="422">Vi phạm business rule (đã enroll, khóa học chưa mở...).</response>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Enroll([FromBody] CreateEnrollmentDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _enrollmentService.EnrollAsync(userId.Value, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<EnrollmentResponseDto>(result.Value!, "Enrollment created successfully."));
    }

    /// <summary>
    /// Lấy danh sách khóa học đã đăng ký của user hiện tại.
    /// </summary>
    /// <returns>Danh sách enrollment kèm thông tin khóa học.</returns>
    /// <response code="200">Lấy danh sách thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyEnrollments()
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _enrollmentService.GetUserEnrollmentsAsync(userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<EnrollmentResponseDto>>(result.Value!, "Enrollments retrieved successfully."));
    }
}