namespace SkillMetrix_LMS.API.Features.Quizzes.Entities;

public class QuizOption
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
    public int OrderIndex { get; set; }

    public QuizQuestion Question { get; set; } = null!;
}