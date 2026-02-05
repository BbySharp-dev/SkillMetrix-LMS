namespace SkillMetrix_LMS.API.Models;

public class UserLessonProgress
{
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public bool IsCompleted { get; set; }
    public int LastWatchedSecond { get; set; }
    public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
