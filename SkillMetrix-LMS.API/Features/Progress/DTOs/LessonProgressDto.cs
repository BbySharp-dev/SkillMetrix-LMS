namespace SkillMetrix_LMS.API.Features.Progress.DTOs;

public class LessonProgressDto
{
    public Guid LessonId { get; set; }
    public bool IsCompleted { get; set; }
    public int LastWatchedSecond { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime LastUpdatedAt { get; set; }
}