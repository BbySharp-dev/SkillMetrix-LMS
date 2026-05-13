using SkillMetrix_LMS.API.Features.Chapters.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class CourseDetailResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Thumbnail { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public decimal Rating { get; set; }
    public List<ChapterWithLessonsDto> Curriculum { get; set; } = new();
    public List<CourseQuizDto> Quizzes { get; set; } = new();
}

public class CourseQuizDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PassingScore { get; set; }
    public int? TimeLimitMinutes { get; set; }
    public int MaxAttempts { get; set; }
    public bool IsFinalQuiz { get; set; }
    public int QuestionCount { get; set; }
}
