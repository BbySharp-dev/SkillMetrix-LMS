using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.Core;

public interface ILessonService
{
    Task<Result<List<LessonResponseDto>>> GetLessonsByChapterAsync(Guid chapterId);
    Task<Result<LessonResponseDto>> CreateLessonAsync(Guid chapterId, CreateLessonDto dto, Guid actorId);
    Task<Result<LessonResponseDto>> UpdateLessonAsync(Guid id, UpdateLessonDto dto, Guid actorId);
    Task<Result<LessonResponseDto>> UploadLessonVideoAsync(Guid lessonId, IFormFile file, double? durationSeconds, Guid actorId);
    Task<Result> DeleteLessonAsync(Guid id, Guid actorId);
}