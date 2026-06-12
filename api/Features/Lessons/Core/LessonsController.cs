using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.Core;

/// <summary>
/// Quản lý danh sách và khởi tạo Bài học (Lessons) thuộc một Chương học cụ thể.
/// </summary>
/// <remarks>
/// API thiết kế theo cấu trúc RESTful lồng nhau: `/api/chapters/{chapterId}/lessons`.
/// Dùng để quản lý danh sách các bài học nằm bên trong một Chương học (Chapter) đã có sẵn.
/// </remarks>
[Route("api/chapters/{chapterId}/lessons")]
[ApiController]
public class ChapterLessonsController(ILessonService lessonService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các bài học thuộc một chương học cụ thể.
    /// </summary>
    /// <remarks>
    /// Trả về danh sách bài học đã được sắp xếp sẵn theo thứ tự hiển thị (`DisplayOrder`). 
    /// Dùng để load danh sách bài học trên giao diện học tập hoặc giao diện quản lý giáo trình của Giảng viên.
    /// </remarks>
    /// <param name="chapterId">Mã định danh (GUID) của Chương học.</param>
    /// <returns>Danh sách bài học thuộc chương đó.</returns>
    /// <response code="200">Lấy danh sách bài học thành công.</response>
    /// <response code="404">Không tìm thấy dữ liệu chương học.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<LessonResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLessons(Guid chapterId)
    {
        var result = await lessonService.GetLessonsByChapterAsync(chapterId);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<List<LessonResponseDto>>(result.Value!, "Lessons retrieved"));
    }

    /// <summary>
    /// Tạo mới một bài học (Chỉ bao gồm thông tin cơ bản, chưa có Video).
    /// </summary>
    /// <remarks>
    /// Bài học mới sẽ được tự động xếp vào cuối danh sách của chương. 
    /// **Lưu ý quy trình:** API này chỉ khởi tạo siêu dữ liệu (Metadata) như Tiêu đề, Mô tả. Để đăng tải Video cho bài học, vui lòng gọi tiếp API `POST /api/lessons/{id}/video`.
    /// </remarks>
    /// <param name="chapterId">Mã định danh (GUID) của Chương học chứa bài học này.</param>
    /// <param name="dto">Nội dung cơ bản của bài học (Title, Description, IsFree...).</param>
    /// <returns>Thông tin bài học vừa được tạo.</returns>
    /// <response code="200">Tạo bài học thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không phải tác giả của khóa học).</response>
    /// <response code="404">Không tìm thấy Chương học hoặc Khóa học liên quan.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateLesson(Guid chapterId, [FromBody] CreateLessonDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue || actorId.Value == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await lessonService.CreateLessonAsync(chapterId, dto, actorId.Value);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<LessonResponseDto>(result.Value!, "Lesson created"));
    }
}

/// <summary>
/// Quản lý thao tác trực tiếp lên một Bài học cụ thể (Update, Delete, Upload Video).
/// </summary>
/// <remarks>
/// Các endpoint này định tuyến độc lập thông qua định danh bài học: `/api/lessons/{id}`.
/// </remarks>
[Route("api/lessons")]
[ApiController]
public class LessonsController(ILessonService lessonService) : BaseApiController
{
    /// <summary>
    /// Cập nhật thông tin chi tiết của bài học.
    /// </summary>
    /// <remarks>
    /// Cho phép Giảng viên/Admin chỉnh sửa tiêu đề, mô tả, nội dung văn bản hoặc thiết lập bài học này là học thử miễn phí (`IsFree = true`).
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của Bài học cần cập nhật.</param>
    /// <param name="dto">Dữ liệu bài học cần cập nhật.</param>
    /// <returns>Thông tin bài học sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật bài học thành công.</response>
    /// <response code="400">Dữ liệu cập nhật không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không có quyền can thiệp vào bài học này).</response>
    /// <response code="404">Không tìm thấy bài học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLesson(Guid id, [FromBody] UpdateLessonDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue || actorId.Value == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await lessonService.UpdateLessonAsync(id, dto, actorId.Value);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<LessonResponseDto>(result.Value!, "Lesson updated"));
    }

    /// <summary>
    /// Xóa mềm (Soft Delete) một bài học khỏi hệ thống.
    /// </summary>
    /// <remarks>
    /// Đánh dấu bài học là đã xóa (IsDeleted = true) để ngăn Học viên truy cập, nhưng vẫn giữ lại dữ liệu trên cơ sở dữ liệu để phòng trường hợp cần khôi phục.
    /// Nếu có Video đính kèm, Video vẫn được giữ trên Cloud Storage.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của Bài học cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa bài học thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ tác giả hoặc Admin mới có quyền).</response>
    /// <response code="404">Không tìm thấy bài học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLesson(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue || actorId.Value == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await lessonService.DeleteLessonAsync(id, actorId.Value);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Lesson deleted"));
    }

    /// <summary>
    /// Upload Video và đính kèm trực tiếp vào bài học.
    /// </summary>
    /// <remarks>
    /// Xử lý việc tải luồng (stream) video từ Client lên Server/Cloud Storage (VD: AWS S3, Cloudinary).
    /// 
    /// **Giới hạn và Yêu cầu:**
    /// - **Content-Type:** `multipart/form-data`
    /// - **Dung lượng tối đa:** 100 MB (`[RequestSizeLimit]`)
    /// - **Định dạng cho phép:** `.mp4`, `.webm`, `.avi`, `.mov`
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của Bài học cần gắn video.</param>
    /// <param name="file">File video upload qua form-data.</param>
    /// <returns>Thông tin bài học đã được cập nhật kèm Video URL.</returns>
    /// <response code="200">Upload video thành công, dữ liệu bài học đã được đồng bộ.</response>
    /// <response code="400">File tải lên bị rỗng hoặc không đúng định dạng cho phép.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ tác giả hoặc Admin mới có quyền).</response>
    /// <response code="404">Không tìm thấy bài học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost("{id}/video")]
    [RequestSizeLimit(100_000_000)] // Giới hạn kích thước Request ~ 100MB
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadLessonVideo(Guid id, IFormFile file)
    {
        if (file.Length == 0)
        {
            return BadRequest(new ApiResponse<string>("No file uploaded."));
        }

        var allowedExtensions = new[] { ".mp4", ".webm", ".avi", ".mov" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            return BadRequest(new ApiResponse<string>($"Invalid file format. Allowed formats: {string.Join(", ", allowedExtensions)}"));
        }

        var actorId = GetCurrentUserId();
        if (!actorId.HasValue || actorId.Value == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await lessonService.UploadLessonVideoAsync(id, file, actorId.Value);

        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<LessonResponseDto>(result.Value!, "Lesson video uploaded"));
    }
}