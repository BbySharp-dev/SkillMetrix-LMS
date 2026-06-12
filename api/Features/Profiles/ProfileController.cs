using SkillMetrix_LMS.API.Features.Profiles.DTOs;

namespace SkillMetrix_LMS.API.Features.Profiles;

/// <summary>
/// Quản lý Hồ sơ người dùng công khai (Public Profiles).
/// </summary>
/// <remarks>
/// Cung cấp các API để truy xuất thông tin hồ sơ của Giảng viên (Instructor) và Học viên (Student).
/// Các endpoint trong Controller này đều ở trạng thái `[AllowAnonymous]`, cho phép khách vãng lai (Guest) xem trang cá nhân của người dùng trên hệ thống mà không cần đăng nhập.
/// </remarks>
[Route("api/profiles")]
[ApiController]
[AllowAnonymous]
public class ProfileController(IProfileService profileService) : BaseApiController
{
    // ─── Instructor ──────────────────────────────────────────────────────────

    /// <summary>
    /// Lấy thông tin hồ sơ công khai của một Giảng viên.
    /// </summary>
    /// <remarks>
    /// Trả về các thông tin cơ bản của Giảng viên như: Họ tên, Tiểu sử (Bio), Ảnh đại diện, Chuyên môn, Tổng số khóa học đang dạy và Điểm đánh giá trung bình.
    /// Dùng để hiển thị trang "Chi tiết Giảng viên" (Instructor Profile Page).
    /// </remarks>
    /// <param name="instructorId">Mã định danh (GUID) của Giảng viên.</param>
    /// <returns>Thông tin chi tiết hồ sơ Giảng viên.</returns>
    /// <response code="200">Lấy thông tin hồ sơ thành công.</response>
    /// <response code="404">Không tìm thấy Giảng viên hoặc người dùng này không có vai trò Instructor.</response>
    [HttpGet("instructors/{instructorId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<InstructorProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInstructorProfile(Guid instructorId)
    {
        var result = await profileService.GetInstructorProfileAsync(instructorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<InstructorProfileDto>(result.Value!, "Lấy profile giảng viên thành công."));
    }

    /// <summary>
    /// Lấy danh sách các khóa học đã xuất bản của một Giảng viên.
    /// </summary>
    /// <remarks>
    /// Trả về danh sách khóa học do Giảng viên này tạo ra. **Lưu ý:** Chỉ trả về các khóa học đang có trạng thái `Published` (Đang mở bán/hiển thị).
    /// Hỗ trợ tính năng phân trang để tối ưu hóa hiệu suất hiển thị trên giao diện.
    /// </remarks>
    /// <param name="instructorId">Mã định danh (GUID) của Giảng viên.</param>
    /// <param name="query">Các tham số lọc và phân trang (PageNumber, PageSize...).</param>
    /// <returns>Danh sách khóa học của Giảng viên đã được phân trang.</returns>
    /// <response code="200">Lấy danh sách khóa học thành công.</response>
    /// <response code="404">Không tìm thấy Giảng viên trên hệ thống.</response>
    [HttpGet("instructors/{instructorId:guid}/courses")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<InstructorCourseDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetInstructorCourses(Guid instructorId, [FromQuery] InstructorCourseQueryDto query)
    {
        var result = await profileService.GetInstructorCoursesAsync(instructorId, query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<InstructorCourseDto>>>(result.Value!, "Instructor courses retrieved successfully."));
    }

    // ─── Student ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Lấy thông tin hồ sơ công khai của một Học viên.
    /// </summary>
    /// <remarks>
    /// Trả về thông tin public cơ bản của Học viên (ví dụ: Tên hiển thị, Ảnh đại diện, Ngày tham gia hệ thống). 
    /// **Bảo mật:** Các thông tin cá nhân nhạy cảm như Email, Số điện thoại sẽ bị ẩn hoàn toàn qua API này để bảo vệ quyền riêng tư.
    /// </remarks>
    /// <param name="studentId">Mã định danh (GUID) của Học viên.</param>
    /// <returns>Thông tin hồ sơ public của Học viên.</returns>
    /// <response code="200">Lấy thông tin hồ sơ thành công.</response>
    /// <response code="404">Không tìm thấy Học viên trên hệ thống.</response>
    [HttpGet("students/{studentId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StudentProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentProfile(Guid studentId)
    {
        var result = await profileService.GetStudentProfileAsync(studentId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<StudentProfileDto>(result.Value!, "Lấy profile học viên thành công."));
    }

    /// <summary>
    /// Lấy danh sách các khóa học mà Học viên đã ghi danh (Đăng ký).
    /// </summary>
    /// <remarks>
    /// API này thường được dùng để hiển thị tab "Các khóa học đang tham gia" trên trang cá nhân public của học viên.
    /// Hỗ trợ tính năng phân trang.
    /// </remarks>
    /// <param name="studentId">Mã định danh (GUID) của Học viên.</param>
    /// <param name="query">Các tham số lọc và phân trang (PageNumber, PageSize...).</param>
    /// <returns>Danh sách khóa học học viên đã đăng ký kèm phân trang.</returns>
    /// <response code="200">Lấy danh sách khóa học thành công.</response>
    /// <response code="404">Không tìm thấy dữ liệu Học viên.</response>
    [HttpGet("students/{studentId:guid}/enrollments")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<StudentEnrollmentDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStudentEnrollments(Guid studentId, [FromQuery] StudentEnrollmentQueryDto query)
    {
        var result = await profileService.GetStudentEnrollmentsAsync(studentId, query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<StudentEnrollmentDto>>>(result.Value!, "Student enrollments retrieved successfully."));
    }
}