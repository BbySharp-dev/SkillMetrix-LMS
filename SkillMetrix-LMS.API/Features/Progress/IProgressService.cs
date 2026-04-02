using SkillMetrix_LMS.API.Features.Progress.DTOs;

namespace SkillMetrix_LMS.API.Features.Progress;

public interface IProgressService
{
    Task<Result<LessonProgressDto>> UpdateLessonProgressAsync(Guid lessonId, Guid userId, UpdateProgressDto dto);
    Task<Result<LessonProgressDto>> GetLessonProgressAsync(Guid lessonId, Guid userId);
    Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid courseId, Guid userId);
}