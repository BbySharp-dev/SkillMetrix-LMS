using SkillMetrix_LMS.API.Features.Progress.DTOs;

namespace SkillMetrix_LMS.API.Features.Progress;

/// <summary>
/// Quản lý và theo dõi Tiến độ học tập (Progress Tracking).
/// </summary>
/// <remarks>
/// Cung cấp các API để đồng bộ tiến độ học tập của Học viên, bao gồm lưu thời gian xem video (để phát tiếp tục), 
/// đánh dấu hoàn thành bài học và tính toán phần trăm hoàn thành của toàn bộ khóa học.
/// Toàn bộ các endpoint đều yêu cầu xác thực JWT (người dùng đã đăng nhập và ghi danh khóa học).
/// </remarks>
[Route("api")]
[ApiController]
public class ProgressController(IProgressService progressService) : BaseApiController
{
    /// <summary>
    /// Lấy tiến độ học tập hiện tại của một Bài học cụ thể.
    /// </summary>
    /// <remarks>
    /// API này trả về mốc thời gian xem gần nhất (Watched Time) và trạng thái hoàn thành (IsCompleted).
    /// Frontend thường gọi API này khi Học viên bắt đầu mở một bài học để tự động tua video đến đúng mốc thời gian đang xem dở trước đó (Video Resume).
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của bài học.</param>
    /// <returns>Thông tin chi tiết về tiến độ của bài học đó.</returns>
    /// <response code="200">Lấy dữ liệu tiến độ thành công.</response>
    /// <response code="401">Missing/Invalid Token (Người dùng chưa đăng nhập).</response>
    /// <response code="404">Không tìm thấy bài học tương ứng.</response>
    [Authorize]
    [HttpGet("lessons/{lessonId}/progress")]
    [ProducesResponseType(typeof(ApiResponse<LessonProgressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLessonProgress(Guid lessonId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await progressService.GetLessonProgressAsync(lessonId, userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<LessonProgressDto>(result.Value!, "Progress retrieved successfully."));
    }

    /// <summary>
    /// Đồng bộ và cập nhật tiến độ học tập của một Bài học.
    /// </summary>
    /// <remarks>
    /// **Hướng dẫn tích hợp cho Frontend:**
    /// - **Đồng bộ thời gian:** Video Player nên gọi API này định kỳ (ví dụ: mỗi 10-15 giây) để cập nhật `WatchedTime`.
    /// - **Đánh dấu hoàn thành:** Hệ thống Backend có thể tự động bật cờ `IsCompleted = true` nếu tỷ lệ thời lượng xem đạt ngưỡng quy định (ví dụ: >90% thời lượng video), hoặc Học viên có thể chủ động trigger đánh dấu hoàn thành nếu là bài học dạng văn bản.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của bài học đang xem.</param>
    /// <param name="dto">Payload chứa mốc thời gian đã xem và/hoặc cờ báo hoàn thành.</param>
    /// <returns>Thông tin tiến độ mới nhất sau khi cập nhật.</returns>
    /// <response code="200">Đồng bộ tiến độ thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy bài học.</response>
    /// <response code="422">Vi phạm quy tắc nghiệp vụ (Ví dụ: Người dùng chưa đăng ký (Enroll) khóa học này nên không được phép lưu tiến độ).</response>
    [Authorize]
    [HttpPut("lessons/{lessonId}/progress")]
    [ProducesResponseType(typeof(ApiResponse<LessonProgressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> UpdateLessonProgress(Guid lessonId, [FromBody] UpdateProgressDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await progressService.UpdateLessonProgressAsync(lessonId, userId.Value, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<LessonProgressDto>(result.Value!, "Progress updated successfully."));
    }

    /// <summary>
    /// Lấy tổng quan thống kê tiến độ học tập của toàn bộ Khóa học.
    /// </summary>
    /// <remarks>
    /// API trả về các chỉ số tổng hợp bao gồm: Tổng số bài học, Số bài học đã hoàn thành và Tỷ lệ phần trăm hoàn thành khóa học (%).
    /// Thường được gọi để hiển thị thanh Progress Bar ngoài trang Dashboard / My Learning của Học viên.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của Khóa học.</param>
    /// <returns>Dữ liệu thống kê tổng quan tiến độ khóa học.</returns>
    /// <response code="200">Lấy dữ liệu thống kê thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    /// <response code="422">Người dùng chưa đăng ký khóa học này nên không có tiến độ tổng quan.</response>
    [Authorize]
    [HttpGet("courses/{courseId}/progress")]
    [ProducesResponseType(typeof(ApiResponse<CourseProgressDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> GetCourseProgress(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await progressService.GetCourseProgressAsync(courseId, userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<CourseProgressDto>(result.Value!, "Progress retrieved successfully."));
    }
}