using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

public interface ICourseService
{
    Task<Result<CourseDetailResponseDto>> GetCourseDetailAsync(Guid id);
    Task<Result<PagedResponse<List<CourseResponseDto>>>> GetCoursesAsync(int pageNumber, int pageSize, CourseQueryDto query);
    Task<Result<CourseResponseDto>> GetCourseByIdAsync(Guid id, Guid? currentUserId = null, string? currentUserRole = null);
    Task<Result<CourseDetailResponseDto>> CreateCourseAsync(CreateCourseDto dto);
    Task<Result<CourseResponseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto, Guid actorId);
    Task<Result> DeleteCourseAsync(Guid id, Guid actorId, bool isAdmin = false);
    Task<Result> RestoreCourseAsync(Guid id, Guid actorId, bool isAdmin = false);
    Task<Result> SubmitCourseAsync(Guid id, Guid actorId);
    Task<Result> ApproveCourseAsync(Guid id, Guid actorId);
    Task<Result> RejectCourseAsync(Guid id, Guid actorId, string reason);
}
