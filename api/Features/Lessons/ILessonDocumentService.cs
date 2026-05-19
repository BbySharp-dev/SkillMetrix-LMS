using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

public interface ILessonDocumentService
{
    Task<IEnumerable<LessonDocumentResponseDto>> GetByLessonIdAsync(Guid lessonId);
    Task<LessonDocumentResponseDto?> GetByIdAsync(Guid id);
    Task<LessonDocumentResponseDto> CreateAsync(Guid lessonId, CreateLessonDocumentDto dto);
    Task<LessonDocumentResponseDto?> UpdateAsync(Guid id, UpdateLessonDocumentDto dto);
    Task<bool> DeleteAsync(Guid id);
}
