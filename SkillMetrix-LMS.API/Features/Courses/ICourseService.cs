using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

public interface ICourseService
{
    Task<Result<PagedResponse<List<CourseResponseDto>>>> GetCoursesAsync(int pageNumber, int pageSize);
    Task<Result<CourseResponseDto>> GetCourseByIdAsync(Guid id);
    Task<Result<CourseResponseDto>> CreateCourseAsync(CreateCourseDto dto);
    Task<Result<CourseResponseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto);
    Task<Result> DeleteCourseAsync(Guid id);
}
