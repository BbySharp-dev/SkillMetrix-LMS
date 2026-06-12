using SkillMetrix_LMS.API.Features.Admin.DTOs;

namespace SkillMetrix_LMS.API.Features.Admin;

/// <summary>
/// Quản lý các tác vụ dành cho Quản trị viên (Admin) và Điều phối viên (Moderator).
/// Cung cấp các API để quản lý người dùng, phân quyền và kiểm duyệt khóa học trong hệ thống.
/// </summary>
[Authorize(Policy = "RequireAdminOrModerator")]
[Route("api/[controller]")]
public class AdminController(IAdminService adminService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách người dùng trong hệ thống (Hỗ trợ phân trang và tìm kiếm).
    /// </summary>
    /// <param name="query">Các tiêu chí tìm kiếm, lọc và phân trang người dùng.</param>
    /// <returns>Danh sách người dùng đã được phân trang.</returns>
    /// <response code="200">Trả về danh sách người dùng thành công.</response>
    /// <response code="401">Người dùng chưa xác thực (Missing/Invalid Token).</response>
    /// <response code="403">Người dùng không có quyền Admin.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpGet("users")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<AdminUserListItemDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers([FromQuery] AdminUserQueryDto query)
    {
        var result = await adminService.GetUsersAsync(query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<AdminUserListItemDto>>>(result.Value!, "Users retrieved"));
    }

    /// <summary>
    /// Tạo mới một người dùng từ trang quản trị.
    /// </summary>
    /// <param name="dto">Thông tin chi tiết của người dùng cần tạo.</param>
    /// <returns>Thông tin người dùng vừa được tạo.</returns>
    /// <response code="201">Tạo người dùng thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ hoặc email/username đã tồn tại.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpPost("users")]
    [ProducesResponseType(typeof(ApiResponse<AdminUserListItemDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
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

    /// <summary>
    /// Xóa một người dùng khỏi hệ thống dựa trên ID.
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của người dùng cần xóa.</param>
    /// <returns>Kết quả của thao tác xóa.</returns>
    /// <response code="200">Xóa người dùng thành công.</response>
    /// <response code="404">Không tìm thấy người dùng.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Cập nhật vai trò (Role) cho một người dùng cụ thể.
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của người dùng.</param>
    /// <param name="dto">Thông tin vai trò mới cần cập nhật.</param>
    /// <returns>Kết quả của thao tác cập nhật quyền.</returns>
    /// <response code="200">Cập nhật vai trò thành công.</response>
    /// <response code="400">Dữ liệu vai trò không hợp lệ.</response>
    /// <response code="404">Không tìm thấy người dùng.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpPut("users/{id:guid}/role")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Lấy danh sách các khóa học để kiểm duyệt (Hỗ trợ phân trang và tìm kiếm).
    /// </summary>
    /// <param name="query">Các tiêu chí tìm kiếm, lọc và phân trang khóa học.</param>
    /// <returns>Danh sách khóa học đã được phân trang.</returns>
    /// <response code="200">Trả về danh sách khóa học thành công.</response>
    [HttpGet("courses")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<AdminCourseListItemDto>>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourses([FromQuery] AdminCourseQueryDto query)
    {
        var result = await adminService.GetCoursesAsync(query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<AdminCourseListItemDto>>>(result.Value!, "Courses retrieved"));
    }

    /// <summary>
    /// Phê duyệt một khóa học, cho phép khóa học được hiển thị/xuất bản trên hệ thống.
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của khóa học cần duyệt.</param>
    /// <returns>Kết quả của thao tác phê duyệt.</returns>
    /// <response code="200">Phê duyệt khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpPut("courses/{id:guid}/approve")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Từ chối một khóa học và yêu cầu giảng viên chỉnh sửa kèm theo lý do.
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của khóa học bị từ chối.</param>
    /// <param name="dto">Chứa lý do từ chối khóa học.</param>
    /// <returns>Kết quả của thao tác từ chối.</returns>
    /// <response code="200">Từ chối khóa học thành công.</response>
    /// <response code="400">Thiếu lý do từ chối.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpPut("courses/{id:guid}/reject")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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

    /// <summary>
    /// Xóa mềm (Soft Delete) một khóa học khỏi hệ thống.
    /// Yêu cầu quyền Quản trị viên (Admin).
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của khóa học cần xóa.</param>
    /// <returns>Kết quả của thao tác xóa mềm.</returns>
    /// <response code="200">Xóa mềm khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpDelete("courses/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCourse(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.DeleteCourseAsync(id, actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Course deleted successfully"));
    }

    /// <summary>
    /// Khôi phục một khóa học đã bị xóa mềm trước đó.
    /// Yêu cầu quyền Quản trị viên (Admin).
    /// </summary>
    /// <param name="id">Mã định danh (GUID) của khóa học cần khôi phục.</param>
    /// <returns>Kết quả của thao tác khôi phục.</returns>
    /// <response code="200">Khôi phục khóa học thành công.</response>
    /// <response code="404">Không tìm thấy khóa học hoặc khóa học chưa bị xóa.</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpPost("courses/{id:guid}/restore")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RestoreCourse(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await adminService.RestoreCourseAsync(id, actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Course restored successfully"));
    }
}