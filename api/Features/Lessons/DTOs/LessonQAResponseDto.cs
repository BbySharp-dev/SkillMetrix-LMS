namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class LessonAnswerDto
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LessonQuestionDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int? VideoTimestampSeconds { get; set; }
    public string? FormattedTimestamp { get; set; }
    public int AnswerCount { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<LessonAnswerDto> Answers { get; set; } = new();
}

public class CreateQuestionDto
{
    public string Content { get; set; } = string.Empty;
    public int? VideoTimestampSeconds { get; set; }
}

public class CreateAnswerDto
{
    public string Content { get; set; } = string.Empty;
}