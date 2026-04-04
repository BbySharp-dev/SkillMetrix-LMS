using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.DTOs.Responses;
using SkillMetrix_LMS.API.Features.Chapters;
using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

/// <summary>
/// Quản lý CRUD khóa học.
/// </summary>
[Route("api/[controller]")]
public class CoursesController : BaseApiController
{
    private readonly ICourseService _courseService;
    private readonly IChapterService _chapterService;
    public CoursesController(ICourseService courseService, IChapterService chapterService)
    {
        _courseService = courseService;
        _chapterService = chapterService;
    }

    /// <summary>
    /// Lấy danh sách tất cả khóa học.
    /// </summary>
    /// <remarks>
    /// Có hỗ trợ phân trang cho danh sách khóa học, mặc định chỉ lấy khóa học đã Publish.
    /// </remarks>
    /// <param name="query">Các tham số lọc động (Search, Status, MinPrice...).</param>
    /// <param name="pageNumber">Số trang hiện tại (mặc định 1).</param>
    /// <param name="pageSize">Số lượng khóa học trên mỗi trang (mặc định 10).</param>
    /// <returns>Danh sách khóa học có phân trang.</returns>
    /// <response code="200">Lấy danh sách khóa học thành công.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<CourseResponseDto>>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses(
        [FromQuery] CourseQueryDto query,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        query ??= new CourseQueryDto(); // Đảm bảo không bị null
        var result = await _courseService.GetCoursesAsync(pageNumber, pageSize, query);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<PagedResponse<List<CourseResponseDto>>>(
            result.Value!,
            "Courses retrieved successfully"
        ));
    }

    /// <summary>
    /// Lấy thông tin cơ bản của một khóa học theo ID.
    /// </summary>
    /// <param name="id">ID của khóa học.</param>
    /// <returns>Thông tin cơ bản của khóa học.</returns>
    /// <response code="200">Lấy thông tin khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học, hoặc khóa học chưa được publish (đối với user thường).</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourse(Guid id)
    {
        Guid? currentUserId = null;
        string? currentUserRole = null;

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var parsedId))
        {
            currentUserId = parsedId;
        }

        currentUserRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        var result = await _courseService.GetCourseByIdAsync(id, currentUserId, currentUserRole);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<CourseResponseDto>(result.Value!, "Course retrieved successfully"));
    }

    /// <summary>
    /// Lấy danh sách chương học và bài học (Curriculum) của một khóa học.
    /// </summary>
    /// <param name="id">ID của khóa học cần lấy giáo trình.</param>
    /// <returns>Danh sách Chapter lồng bên trong là các Lesson.</returns>
    /// <response code="200">Lấy dữ liệu Curriculum thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpGet("{id}/curriculum")]
    [ProducesResponseType(typeof(ApiResponse<List<ChapterWithLessonsDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurriculum(Guid id)
    {
        var result = await _chapterService.GetCurriculumAsync(id);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<List<ChapterWithLessonsDto>>(result.Value!, "Curriculum retrieved"));
    }

    /// <summary>
    /// Tạo một khóa học mới.
    /// </summary>
    /// <param name="dto">Thông tin khóa học mới.</param>
    /// <returns>Thông tin khóa học vừa tạo.</returns>
    /// <response code="201">Tạo khóa học thành công.</response>
    /// <response code="400">Thông tin cung cấp không hợp lệ.</response>
    /// <response code="404">Không tìm thấy giảng viên được chỉ định.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateCourse(CreateCourseDto dto)
    {
        // FluentValidation tự động validate, nếu invalid trả về 400 Bad Request

        var result = await _courseService.CreateCourseAsync(dto);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = result.Value!.Id },
            new ApiResponse<CourseResponseDto>(result.Value, "Course created successfully")
        );
    }


    /// <summary>
    /// Cập nhật thông tin cơ bản của khóa học.
    /// </summary>
    /// <param name="id">ID của khóa học cần cập nhật.</param>
    /// <param name="dto">Các thông tin cần cập nhật.</param>
    /// <returns>Thông tin khóa học sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật khóa học thành công.</response>
    /// <response code="400">Thông tin cập nhật không hợp lệ (ví dụ: đổi giá khóa public).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<CourseResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCourse(Guid id, UpdateCourseDto dto)
    {
        var result = await _courseService.UpdateCourseAsync(id, dto);

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
    /// Xóa mềm một khóa học.
    /// </summary>
    /// <param name="id">ID của khóa học cần xóa.</param>
    /// <returns>Trạng thái thực thi.</returns>
    /// <response code="200">Xóa khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    /// <response code="409">Không thể xóa vì khóa học đã có học viên đăng ký.</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var result = await _courseService.DeleteCourseAsync(id);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course deleted successfully"));
    }

    /// <summary>
    /// Giảng viên nộp khóa học chờ Admin duyệt.
    /// </summary>
    /// <param name="id">ID khóa học.</param>
    /// <returns>Trạng thái nộp.</returns>
    /// <response code="200">Nộp khóa học thành công.</response>
    /// <response code="401">Chưa đăng nhập.</response>
    /// <response code="403">Không có quyền (Không phải tác giả khóa học).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPut("{id}/submit")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SubmitCourse(Guid id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _courseService.SubmitCourseAsync(id, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course submitted successfully"));
    }

    /// <summary>
    /// Admin/Moderator duyệt khóa học.
    /// </summary>
    /// <param name="id">ID khóa học.</param>
    /// <returns>Trạng thái duyệt.</returns>
    /// <response code="200">Duyệt thành công.</response>
    /// <response code="401">Chưa đăng nhập.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Admin/Moderator).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin,Moderator")]
    [HttpPut("{id}/approve")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveCourse(Guid id)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _courseService.ApproveCourseAsync(id, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course approved successfully"));
    }

    /// <summary>
    /// Admin/Moderator từ chối khóa học.
    /// </summary>
    /// <param name="id">ID khóa học.</param>
    /// <param name="dto">Lý do từ chối.</param>
    /// <returns>Trạng thái từ chối.</returns>
    /// <response code="200">Từ chối thành công.</response>
    /// <response code="400">Thiếu lý do từ chối.</response>
    /// <response code="401">Chưa đăng nhập.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Admin/Moderator).</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin,Moderator")]
    [HttpPut("{id}/reject")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectCourse(Guid id, [FromBody] RejectCourseDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto?.Reason))
        {
            return BadRequest(new ApiResponse<object>("Reason is required for rejection"));
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _courseService.RejectCourseAsync(id, actorId, dto.Reason);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course rejected successfully"));
    }
}