using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

public interface IEnrollmentService
{
    Task<Result<EnrollmentResponseDto>> EnrollAsync(Guid userId, CreateEnrollmentDto dto);
    Task<Result<List<EnrollmentResponseDto>>> GetUserEnrollmentsAsync(Guid userId);
}