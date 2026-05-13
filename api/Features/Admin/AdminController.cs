using System.Security.Claims;
using SkillMetrix_LMS.API.Features.Admin.DTOs;

namespace SkillMetrix_LMS.API.Features.Admin;

[Authorize(Policy = "RequireAdmin")]
[Route("api/[controller]")]
public class AdminController(IAdminService adminService) : BaseApiController
{
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] AdminUserQueryDto query)
    {
        var result = await adminService.GetUsersAsync(query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<AdminUserListItemDto>>>(result.Value!, "Users retrieved"));
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.CreateUserAsync(dto, actorId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return CreatedAtAction(nameof(GetUsers), new ApiResponse<AdminUserListItemDto>(result.Value!, "User created successfully"));
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var actorId = GetCurrentUserId();
        if (actorId == null)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.DeleteUserAsync(id, actorId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "User deleted successfully"));
    }

    [HttpPut("users/{id:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.UpdateUserRoleAsync(id, dto.Role, actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "User role updated"));
    }

    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses([FromQuery] AdminCourseQueryDto query)
    {
        var result = await adminService.GetCoursesAsync(query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<AdminCourseListItemDto>>>(result.Value!, "Courses retrieved"));
    }

    [HttpPut("courses/{id:guid}/approve")]
    public async Task<IActionResult> ApproveCourse(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.ApproveCourseAsync(id, actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Course approved"));
    }

    [HttpPut("courses/{id:guid}/reject")]
    public async Task<IActionResult> RejectCourse(Guid id, [FromBody] AdminRejectCourseDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.RejectCourseAsync(id, dto.Reason, actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Course rejected"));
    }
}
