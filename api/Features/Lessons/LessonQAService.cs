using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Models;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

public class LessonQAService(ApplicationDbContext context) : ILessonQAService
{
    public async Task<IEnumerable<LessonQuestionDto>> GetQuestionsAsync(Guid lessonId)
    {
        var questions = await context.LessonQuestions
            .Include(q => q.Answers)
            .Include(q => q.User)
            .Where(q => q.LessonId == lessonId)
            .OrderByDescending(q => q.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return questions.Select(MapQuestion);
    }

    public async Task<LessonQuestionDto?> CreateQuestionAsync(Guid lessonId, Guid userId, CreateQuestionDto dto)
    {
        var question = new LessonQuestion
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            UserId = userId,
            Content = dto.Content,
            VideoTimestampSeconds = dto.VideoTimestampSeconds,
            CreatedAt = DateTime.UtcNow
        };

        context.LessonQuestions.Add(question);
        await context.SaveChangesAsync();

        // Reload with user info
        await context.Entry(question).Reference(q => q.User).LoadAsync();
        return MapQuestion(question);
    }

    public async Task<bool> DeleteQuestionAsync(Guid id, Guid userId)
    {
        var question = await context.LessonQuestions
            .FirstOrDefaultAsync(q => q.Id == id && q.UserId == userId);

        if (question == null) return false;

        context.LessonQuestions.Remove(question);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<LessonAnswerDto?> CreateAnswerAsync(Guid questionId, Guid userId, CreateAnswerDto dto)
    {
        var question = await context.LessonQuestions
            .Include(q => q.User)
            .FirstOrDefaultAsync(q => q.Id == questionId);

        if (question == null) return null;

        var answer = new LessonAnswer
        {
            Id = Guid.NewGuid(),
            QuestionId = questionId,
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        context.LessonAnswers.Add(answer);
        question.AnswerCount++;
        await context.SaveChangesAsync();

        // Reload user
        await context.Entry(answer).Reference(a => a.User).LoadAsync();
        return MapAnswer(answer);
    }

    public async Task<bool> DeleteAnswerAsync(Guid id, Guid userId)
    {
        var answer = await context.LessonAnswers
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (answer == null) return false;

        context.LessonAnswers.Remove(answer);
        await context.SaveChangesAsync();
        return true;
    }

    private static string? FormatTimestamp(int? seconds)
    {
        if (!seconds.HasValue) return null;
        var ts = TimeSpan.FromSeconds(seconds.Value);
        if (ts.Hours > 0)
            return $"{(int)ts.TotalHours}:{ts.Minutes:D2}:{ts.Seconds:D2}";
        return $"{ts.Minutes:D2}:{ts.Seconds:D2}";
    }

    private static LessonQuestionDto MapQuestion(LessonQuestion q)
    {
        return new LessonQuestionDto
        {
            Id = q.Id,
            LessonId = q.LessonId,
            Content = q.Content,
            VideoTimestampSeconds = q.VideoTimestampSeconds,
            FormattedTimestamp = FormatTimestamp(q.VideoTimestampSeconds),
            AnswerCount = q.AnswerCount,
            UserId = q.UserId.ToString(),
            UserFullName = q.User?.FullName ?? "Unknown",
            UserAvatarUrl = q.User?.AvatarUrl,
            CreatedAt = q.CreatedAt,
            Answers = q.Answers?.Select(MapAnswer).ToList() ?? new(),
        };
    }

    private static LessonAnswerDto MapAnswer(LessonAnswer a)
    {
        return new LessonAnswerDto
        {
            Id = a.Id,
            QuestionId = a.QuestionId,
            Content = a.Content,
            UserId = a.UserId.ToString(),
            UserFullName = a.User?.FullName ?? "Unknown",
            UserAvatarUrl = a.User?.AvatarUrl,
            CreatedAt = a.CreatedAt
        };
    }
}
