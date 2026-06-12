using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.QA;

public interface ILessonQAService
{
    Task<IEnumerable<LessonQuestionDto>> GetQuestionsAsync(Guid lessonId);
    Task<LessonQuestionDto?> CreateQuestionAsync(Guid lessonId, Guid userId, CreateQuestionDto dto);
    Task<bool> DeleteQuestionAsync(Guid id, Guid userId);
    Task<LessonAnswerDto?> CreateAnswerAsync(Guid questionId, Guid userId, CreateAnswerDto dto);
    Task<bool> DeleteAnswerAsync(Guid id, Guid userId);
}