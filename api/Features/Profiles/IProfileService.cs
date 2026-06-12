using SkillMetrix_LMS.API.Features.Profiles.DTOs;

namespace SkillMetrix_LMS.API.Features.Profiles;

public interface IProfileService
{
    /// <summary>
    /// Lấy thông tin profile của giảng viên.
    /// </summary>
    Task<Result<InstructorProfileDto>> GetInstructorProfileAsync(Guid instructorId);

    /// <summary>
    /// Lấy danh sách khóa học của giảng viên.
    /// </summary>
    Task<Result<PagedResponse<List<InstructorCourseDto>>>> GetInstructorCoursesAsync(Guid instructorId, InstructorCourseQueryDto query);

    /// <summary>
    /// Lấy thông tin profile của học viên.
    /// </summary>
    Task<Result<StudentProfileDto>> GetStudentProfileAsync(Guid studentId);

    /// <summary>
    /// Lấy danh sách khóa học đã đăng ký của học viên.
    /// </summary>
    Task<Result<PagedResponse<List<StudentEnrollmentDto>>>> GetStudentEnrollmentsAsync(Guid studentId, StudentEnrollmentQueryDto query);
}