using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Progress.DTOs;
using SkillMetrix_LMS.API.Shared.Common;

namespace SkillMetrix_LMS.API.Features.Progress;

/// <summary>
/// Controller quản lý tiến độ học tập của user (Progress).
/// Tất cả endpoint yêu cầu xác thực JWT.
/// </summary>
[Route("api")]
public class ProgressController : BaseApiController
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    /// <summary>
    /// Cập nhật tiến độ học của user cho một bài học cụ thể.
    /// Tự động đánh dấu hoàn thành nếu đạt điều kiện.
    /// </summary>
    /// <param name="lessonId">ID của bài học cần cập nhật tiến độ.</param>
    /// <param name="dto">Thông tin tiến độ: thời gian đã xem, trạng thái hoàn thành.</param>
    /// <returns>Thông tin tiến độ sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật tiến độ thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="404">Bài học không tồn tại.</response>
    /// <response code="422">Vi phạm business rule (chưa enroll khóa học...).</response>
    [Authorize]
    [HttpPut("lessons/{lessonId}/progress")]
    public async Task<IActionResult> UpdateLessonProgress(Guid lessonId, [FromBody] UpdateProgressDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _progressService.UpdateLessonProgressAsync(lessonId, userId.Value, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<LessonProgressDto>(result.Value!, "Progress updated successfully."));
    }

    /// <summary>
    /// Lấy tiến độ học của user cho một bài học cụ thể.
    /// </summary>
    /// <param name="lessonId">ID của bài học cần xem tiến độ.</param>
    /// <returns>Thông tin tiến độ: thời gian đã xem, trạng thái hoàn thành.</returns>
    /// <response code="200">Lấy tiến độ thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="404">Bài học không tồn tại.</response>
    [Authorize]
    [HttpGet("lessons/{lessonId}/progress")]
    public async Task<IActionResult> GetLessonProgress(Guid lessonId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _progressService.GetLessonProgressAsync(lessonId, userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<LessonProgressDto>(result.Value!, "Progress retrieved successfully."));
    }

    /// <summary>
    /// Lấy tổng quan tiến độ học của user cho toàn bộ khóa học.
    /// Bao gồm % hoàn thành, số bài đã học, số bài còn lại.
    /// </summary>
    /// <param name="courseId">ID của khóa học cần xem tiến độ.</param>
    /// <returns>Thông tin tiến độ tổng quan của khóa học.</returns>
    /// <response code="200">Lấy tiến độ thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="404">Khóa học không tồn tại.</response>
    /// <response code="422">User chưa đăng ký khóa học này.</response>
    [Authorize]
    [HttpGet("courses/{courseId}/progress")]
    public async Task<IActionResult> GetCourseProgress(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _progressService.GetCourseProgressAsync(courseId, userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<CourseProgressDto>(result.Value!, "Progress retrieved successfully."));
    }
}