using SkillMetrix_LMS.API.Features.Profiles.DTOs;

namespace SkillMetrix_LMS.API.Features.Profiles;

[Route("api/profiles")]
[ApiController]
[AllowAnonymous]
public class ProfileController(IProfileService profileService) : BaseApiController
{
    // ─── Instructor ──────────────────────────────────────────────────────────

    /// <summary>
    /// Lấy thông tin profile của giảng viên.
    /// </summary>
    [HttpGet("instructors/{instructorId:guid}")]
    public async Task<IActionResult> GetInstructorProfile(Guid instructorId)
    {
        var result = await profileService.GetInstructorProfileAsync(instructorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<InstructorProfileDto>(result.Value!, "Lấy profile giảng viên thành công."));
    }

    /// <summary>
    /// Lấy danh sách khóa học của giảng viên.
    /// </summary>
    [HttpGet("instructors/{instructorId:guid}/courses")]
    public async Task<IActionResult> GetInstructorCourses(Guid instructorId, [FromQuery] string? status = null)
    {
        var result = await profileService.GetInstructorCoursesAsync(instructorId, status);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<InstructorCourseDto>>(result.Value!, "Lấy danh sách khóa học thành công."));
    }

    // ─── Student ─────────────────────────────────────────────────────────────

    /// <summary>
    /// Lấy thông tin profile của học viên.
    /// </summary>
    [HttpGet("students/{studentId:guid}")]
    public async Task<IActionResult> GetStudentProfile(Guid studentId)
    {
        var result = await profileService.GetStudentProfileAsync(studentId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<StudentProfileDto>(result.Value!, "Lấy profile học viên thành công."));
    }

    /// <summary>
    /// Lấy danh sách khóa học đã đăng ký của học viên.
    /// </summary>
    [HttpGet("students/{studentId:guid}/enrollments")]
    public async Task<IActionResult> GetStudentEnrollments(Guid studentId)
    {
        var result = await profileService.GetStudentEnrollmentsAsync(studentId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<StudentEnrollmentDto>>(result.Value!, "Lấy danh sách khóa học thành công."));
    }
}
