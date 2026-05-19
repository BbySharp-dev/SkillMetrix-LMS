using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

public interface ILessonNoteService
{
    Task<IEnumerable<LessonNoteResponseDto>> GetByLessonAsync(Guid lessonId, Guid userId);
    Task<LessonNoteResponseDto?> GetByIdAsync(Guid id);
    Task<LessonNoteResponseDto> CreateAsync(Guid lessonId, Guid userId, CreateLessonNoteDto dto);
    Task<LessonNoteResponseDto?> UpdateAsync(Guid id, Guid userId, UpdateLessonNoteDto dto);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
