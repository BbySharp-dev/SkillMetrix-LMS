using SkillMetrix_LMS.API.Features.Enrollments.DTOs;

namespace SkillMetrix_LMS.API.Features.Enrollments;

public interface IEnrollmentService
{
    Task<Result<EnrollmentResponseDto>> EnrollAsync(Guid userId, CreateEnrollmentDto dto);
    Task<Result<PagedResponse<List<EnrollmentResponseDto>>>> GetUserEnrollmentsAsync(Guid userId, EnrollmentQueryDto query);
    Task<Result<bool>> CheckEnrollmentAsync(Guid userId, Guid courseId);
}