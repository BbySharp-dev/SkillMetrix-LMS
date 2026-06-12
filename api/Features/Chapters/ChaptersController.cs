using SkillMetrix_LMS.API.Features.Chapters.DTOs;

namespace SkillMetrix_LMS.API.Features.Chapters;

/// <summary>
/// Quản lý Chương học (Chapters) thuộc một Khóa học.
/// </summary>
/// <remarks>
/// Chương học là cấp độ phân nhóm thứ nhất trong Cấu trúc giáo trình (Curriculum), bên trong mỗi Chương học sẽ chứa nhiều Bài học (Lessons).
/// Các API này thiết kế theo chuẩn RESTful lồng nhau: `/api/courses/{courseId}/chapters`.
/// </remarks>
[Route("api/courses/{courseId}/chapters")]
[ApiController]
public class ChaptersController(IChapterService chapterService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các Chương học của một Khóa học cụ thể.
    /// </summary>
    /// <remarks>
    /// Trả về danh sách Chapter đã được sắp xếp sẵn theo thứ tự hiển thị (`DisplayOrder`).
    /// Dùng để load danh sách khung giáo trình cho màn hình giới thiệu khóa học hoặc màn hình quản lý của Giảng viên.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của Khóa học.</param>
    /// <returns>Danh sách các chương học.</returns>
    /// <response code="200">Lấy danh sách thành công.</response>
    /// <response code="404">Không tìm thấy dữ liệu Khóa học tương ứng.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ChapterResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChapters(Guid courseId)
    {
        var result = await chapterService.GetChaptersByCourseAsync(courseId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<List<ChapterResponseDto>>(result.Value!, "Chapters retrieved"));
    }

    /// <summary>
    /// Tạo mới một Chương học vào cuối danh sách của Khóa học.
    /// </summary>
    /// <remarks>
    /// Chương học mới tạo ra sẽ tự động được gán `DisplayOrder` lớn nhất (nằm ở cuối cùng).
    /// Chỉ có Tác giả của khóa học hoặc Quản trị viên mới được phép thực hiện thao tác này.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của Khóa học muốn thêm Chapter.</param>
    /// <param name="dto">Thông tin cơ bản của Chapter (Tiêu đề, Mô tả...).</param>
    /// <returns>Thông tin Chương học vừa khởi tạo.</returns>
    /// <response code="200">Tạo mới chương học thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ (Validation Error).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không phải tác giả khóa học).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ChapterResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateChapter(Guid courseId, [FromBody] CreateChapterDto dto)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await chapterService.CreateChapterAsync(courseId, dto, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<ChapterResponseDto>(result.Value!, "Chapter created"));
    }

    /// <summary>
    /// Cập nhật thông tin chi tiết của một Chương học.
    /// </summary>
    /// <remarks>
    /// Cho phép chỉnh sửa tiêu đề (Title) hoặc mô tả (Description). Không dùng API này để thay đổi vị trí hiển thị (Dùng API `/reorder` thay thế).
    /// </remarks>
    /// <param name="_">Tham số courseId từ URL (Bỏ qua trong xử lý logic cập nhật).</param>
    /// <param name="id">Mã định danh (GUID) của Chương học cần cập nhật.</param>
    /// <param name="dto">Dữ liệu cần cập nhật.</param>
    /// <returns>Thông tin Chương học sau khi chỉnh sửa.</returns>
    /// <response code="200">Cập nhật thông tin thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không có quyền cập nhật).</response>
    /// <response code="404">Không tìm thấy chương học cần cập nhật.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ChapterResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateChapter([FromRoute(Name = "courseId")] Guid _, Guid id, [FromBody] UpdateChapterDto dto)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await chapterService.UpdateChapterAsync(id, dto, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<ChapterResponseDto>(result.Value!, "Chapter updated"));
    }

    /// <summary>
    /// Xóa mềm (Soft Delete) một Chương học khỏi Khóa học.
    /// </summary>
    /// <remarks>
    /// **Ràng buộc an toàn:** Hệ thống sẽ chặn thao tác xóa và trả về lỗi 409 (Conflict) nếu bên trong Chương học này vẫn còn chứa các Bài học (Lessons). 
    /// Giảng viên cần phải xóa hoặc di chuyển toàn bộ bài học sang chương khác trước khi thực hiện xóa chương này.
    /// </remarks>
    /// <param name="_">Tham số courseId từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Chương học cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa mềm chương học thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không có quyền xóa).</response>
    /// <response code="404">Không tìm thấy chương học.</response>
    /// <response code="409">Conflict - Không thể xóa do vẫn còn bài học tồn tại bên trong chương này.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteChapter([FromRoute(Name = "courseId")] Guid _, Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await chapterService.DeleteChapterAsync(id, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Chapter deleted"));
    }

    /// <summary>
    /// Cập nhật vị trí hiển thị (Reorder / Kéo thả) của một Chương học.
    /// </summary>
    /// <remarks>
    /// API này được thiết kế để phục vụ tính năng "Drag and Drop" (Kéo thả) trên giao diện Frontend.
    /// Khi một Chapter bị thay đổi vị trí, hệ thống sẽ tự động tính toán và cập nhật lại `DisplayOrder` của tất cả các Chapter bị ảnh hưởng trong cùng Khóa học đó.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của Khóa học.</param>
    /// <param name="id">Mã định danh (GUID) của Chương học được kéo thả.</param>
    /// <param name="dto">Chứa Index cũ và Index mới của chương học trong mảng.</param>
    /// <returns>Trạng thái cập nhật thứ tự.</returns>
    /// <response code="200">Đồng bộ vị trí mới thành công.</response>
    /// <response code="400">Dữ liệu Index truyền lên không hợp lệ (Vượt quá giới hạn mảng).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không có quyền can thiệp vào khóa học này).</response>
    /// <response code="404">Không tìm thấy khóa học hoặc chương học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPut("{id}/reorder")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderChapter(Guid courseId, Guid id, [FromBody] ReorderDto dto)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await chapterService.ReorderChapterAsync(courseId, id, dto, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Chapter reordered"));
    }
}