using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

/// <summary>
/// Quản lý CRUD khóa học.
/// </summary>
[Route("api/[controller]")]
public class CoursesController : BaseApiController
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    /// <summary>
    /// Lấy danh sách tất cả khóa học (có phân trang)
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCourses(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _courseService.GetCoursesAsync(pageNumber, pageSize);

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
    /// Lấy chi tiết một khóa học theo ID
    /// </summary>
    [HttpGet("{id}")]
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
    /// Tạo khóa học mới
    /// </summary>
    [HttpPost]
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
    /// Cập nhật khóa học (partial update)
    /// </summary>
    [HttpPut("{id}")]
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
    /// Xóa khóa học
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var result = await _courseService.DeleteCourseAsync(id);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Course deleted successfully"));
    }
}