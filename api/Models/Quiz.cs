using System.ComponentModel.DataAnnotations;

namespace SkillMetrix_LMS.API.Models;

public class Quiz
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }

    /// <summary>Nullable: if set, this quiz belongs to a specific chapter (shown after lessons).</summary>
    public Guid? ChapterId { get; set; }

    /// <summary>Nullable: if set, this quiz belongs to a specific lesson.</summary>
    public Guid? LessonId { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
    public decimal PassingScore { get; set; } = 70;
    public int? TimeLimitMinutes { get; set; }
    public int MaxAttempts { get; set; } = 1;
    public bool IsFinalQuiz { get; set; } = false;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public Course Course { get; set; } = null!;
    public Chapter? Chapter { get; set; }
    public Lesson? Lesson { get; set; }
    public ICollection<QuizQuestion> Questions { get; set; } = new List<QuizQuestion>();
    public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
}
