using SkillMetrix_LMS.API.Features.Chapters;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;
using SkillMetrix_LMS.API.Features.Courses.DTOs;
using SkillMetrix_LMS.API.Features.Admin.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

/// <summary>
/// Quản lý các nghiệp vụ cốt lõi của Khóa học (Courses).
/// Cung cấp API cho Học viên (tìm kiếm, xem chi tiết), Giảng viên (tạo, quản lý khóa học) và Admin/Moderator (kiểm duyệt).
/// </summary>
[Route("api/[controller]")]
public class CoursesController(ICourseService courseService, IChapterService chapterService)
    : BaseApiController
{
    /// <summary>
    /// Lấy danh sách tất cả khóa học.
    /// </summary>
    /// <remarks>
    /// API Public dành cho trang chủ hoặc trang tìm kiếm.
    /// - Mặc định **chỉ hiển thị** các khóa học có trạng thái `Published`.
    /// - Hỗ trợ lọc động mạnh mẽ (theo danh mục, khoảng giá, đánh giá...).
    /// </remarks>
    /// <param name="query">Các tham số lọc động (Search, Status, MinPrice...).</param>
    /// <param name="pageNumber">Số trang hiện tại (mặc định: 1).</param>
    /// <param name="pageSize">Số lượng khóa học trên mỗi trang (mặc định: 10).</param>
    /// <returns>Danh sách khóa học kèm theo metadata phân trang.</returns>
    /// <response code="200">Lấy danh sách khóa học thành công.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<CourseResponseDto>>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses(
        [FromQuery] CourseQueryDto query,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await courseService.GetCoursesAsync(pageNumber, pageSize, query);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<PagedResponse<List<CourseResponseDto>>>(result.Value!, "Courses retrieved successfully"));
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một khóa học theo ID.
    /// </summary>
    /// <remarks>
    /// Cơ chế hiển thị phụ thuộc vào vai trò của người gọi API:
    /// - **Người dùng thường / Khách:** Chỉ xem được khóa học đã `Published`.
    /// - **Tác giả (Instructor):** Xem được khóa học của chính mình ở mọi trạng thái.
    /// - **Admin / Moderator:** Xem được mọi khóa học ở mọi trạng thái.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Thông tin chi tiết của khóa học.</returns>
    /// <response code="200">Lấy thông tin khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học, hoặc khóa học đang bị ẩn đối với user hiện tại.</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourse(Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var currentUserRole = GetCurrentUserRole();

        var result = await courseService.GetCourseByIdAsync(id, currentUserId, currentUserRole);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<CourseResponseDto>(result.Value!, "Course retrieved successfully"));
    }

    /// <summary>
    /// Lấy toàn bộ giáo trình (Curriculum) của một khóa học.
    /// </summary>
    /// <remarks>
    /// Trả về cấu trúc cây phân cấp: **Khóa học -> Các Chương học (Chapters) -> Các Bài học (Lessons)**.
    /// Dùng để hiển thị danh sách bài học ở trang giới thiệu khóa học hoặc trong màn hình học tập.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Danh sách Chapter lồng bên trong là các Lesson.</returns>
    /// <response code="200">Lấy dữ liệu Curriculum thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpGet("{id}/curriculum")]
    [ProducesResponseType(typeof(ApiResponse<List<ChapterWithLessonsDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurriculum(Guid id)
    {
        var result = await chapterService.GetCurriculumAsync(id);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<List<ChapterWithLessonsDto>>(result.Value!, "Curriculum retrieved"));
    }

    /// <summary>
    /// Tạo bản nháp (Draft) cho một khóa học mới.
    /// </summary>
    /// <remarks>
    /// Khóa học sau khi tạo sẽ có trạng thái mặc định là `Draft`.
    /// API này sẽ tự động validate dữ liệu đầu vào (FluentValidation).
    /// </remarks>
    /// <param name="dto">Payload chứa thông tin cơ bản của khóa học.</param>
    /// <returns>Thông tin khóa học vừa khởi tạo.</returns>
    /// <response code="201">Tạo khóa học thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ.</response>
    /// <response code="404">Không tìm thấy Giảng viên được chỉ định trong hệ thống.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CourseDetailResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
    {
        // FluentValidation tự động validate, nếu invalid trả về 400 Bad Request

        var result = await courseService.CreateCourseAsync(dto);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = result.Value!.Id },
            new ApiResponse<CourseDetailResponseDto>(result.Value, "Course created successfully")
        );
    }

    /// <summary>
    /// Cập nhật thông tin cơ bản của khóa học.
    /// </summary>
    /// <remarks>
    /// Chỉ có **Tác giả** của khóa học hoặc **Admin** mới có quyền gọi API này.
    /// Một số thông tin nhạy cảm (như Giá tiền) có thể bị chặn cập nhật nếu khóa học đã được public.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <param name="dto">Payload chứa các trường cần cập nhật.</param>
    /// <returns>Thông tin khóa học sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật thành công.</response>
    /// <response code="400">Dữ liệu cập nhật không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không phải tác giả khóa học).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCourse(Guid id, UpdateCourseDto dto)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await courseService.UpdateCourseAsync(id, dto, actorId.Value);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<CourseResponseDto>(
            result.Value!,
            "Course updated successfully"
        ));
    }

    /// <summary>
    /// Xóa mềm (Soft Delete) một khóa học.
    /// </summary>
    /// <remarks>
    /// Đánh dấu khóa học là đã xóa (IsDeleted = true) thay vì xóa vật lý khỏi Database.
    /// Không cho phép xóa nếu khóa học đã có học viên đăng ký (tránh mất dữ liệu học tập).
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Trạng thái xóa.</returns>
    /// <response code="200">Xóa mềm thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Không có quyền thực hiện thao tác.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    /// <response code="409">Conflict - Đã có học viên đăng ký, không thể xóa.</response>
    [Authorize]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var isAdmin = GetCurrentUserRole() == "Admin";
        var result = await courseService.DeleteCourseAsync(id, actorId.Value, isAdmin);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course deleted successfully"));
    }

    /// <summary>
    /// Khôi phục một khóa học đã bị xóa mềm.
    /// </summary>
    /// <remarks>
    /// Chỉ dành cho Giảng viên (khôi phục khóa học của chính mình) hoặc Admin.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Trạng thái khôi phục.</returns>
    /// <response code="200">Khôi phục thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Không có quyền thực hiện thao tác.</response>
    /// <response code="404">Không tìm thấy khóa học (hoặc khóa học chưa bị xóa).</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost("{id}/restore")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RestoreCourse(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var isAdmin = GetCurrentUserRole() == "Admin";
        var result = await courseService.RestoreCourseAsync(id, actorId.Value, isAdmin);
        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Course restored successfully"));
    }

    /// <summary>
    /// Lấy danh sách khóa học thuộc sở hữu của Giảng viên hiện tại.
    /// </summary>
    /// <remarks>
    /// Hệ thống sẽ tự động trích xuất `InstructorId` từ JWT Token của người request.
    /// Không cần truyền InstructorId thủ công vào payload.
    /// </remarks>
    /// <param name="query">Các tiêu chí bộ lọc.</param>
    /// <param name="pageNumber">Số trang (Mặc định: 1).</param>
    /// <param name="pageSize">Kích thước trang (Mặc định: 10).</param>
    /// <returns>Danh sách khóa học của giảng viên.</returns>
    /// <response code="200">Lấy dữ liệu thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpGet("instructor/mine")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<CourseResponseDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyCourses(
        [FromQuery] CourseQueryDto query,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        // ⚠️ Debug: log actorId để verify token

        query.InstructorId = actorId.Value;

        // ⚠️ Debug: verify DTO binding

        var result = await courseService.GetCoursesAsync(pageNumber, pageSize, query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<CourseResponseDto>>>(result.Value!, "Instructor courses retrieved successfully"));
    }

    /// <summary>
    /// Nộp khóa học để chờ Admin kiểm duyệt.
    /// </summary>
    /// <remarks>
    /// Chuyển trạng thái khóa học từ `Draft` sang `PendingApproval`.
    /// Chỉ tác giả của khóa học mới có quyền gọi API này.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Trạng thái nộp kiểm duyệt.</returns>
    /// <response code="200">Nộp khóa học thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Không có quyền (Không phải tác giả khóa học).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize]
    [HttpPut("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitCourse(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await courseService.SubmitCourseAsync(id, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course submitted successfully"));
    }

    /// <summary>
    /// Phê duyệt khóa học (Publish).
    /// </summary>
    /// <remarks>
    /// Chuyển trạng thái khóa học từ `PendingApproval` sang `Published`. 
    /// Sau khi gọi API này thành công, khóa học sẽ chính thức xuất hiện trên nền tảng.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Trạng thái phê duyệt.</returns>
    /// <response code="200">Duyệt và Publish thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Role không hợp lệ).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize(Roles = "Admin,Moderator")]
    [HttpPut("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveCourse(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await courseService.ApproveCourseAsync(id, actorId.Value);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course approved successfully"));
    }

    /// <summary>
    /// Từ chối khóa học và yêu cầu chỉnh sửa.
    /// </summary>
    /// <remarks>
    /// Trả khóa học về trạng thái `Draft` hoặc `Rejected` kèm theo **lý do từ chối** gửi cho Giảng viên.
    /// </remarks>
    /// <param name="id">Mã định danh (GUID) của khóa học.</param>
    /// <param name="dto">Payload chứa lý do từ chối (Bắt buộc).</param>
    /// <returns>Trạng thái từ chối.</returns>
    /// <response code="200">Từ chối thành công.</response>
    /// <response code="400">Không cung cấp lý do từ chối hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Role không hợp lệ).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize(Roles = "Admin,Moderator")]
    [HttpPut("{id}/reject")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectCourse(Guid id, [FromBody] AdminRejectCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Reason))
        {
            return BadRequest(new ApiResponse<object>("Reason is required for rejection"));
        }

        var actorId = GetCurrentUserId();
        if (actorId is null || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await courseService.RejectCourseAsync(id, actorId.Value, dto.Reason);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course rejected successfully"));
    }
}