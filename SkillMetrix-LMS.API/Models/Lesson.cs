namespace SkillMetrix_LMS.API.Models;

public class Lesson
{
    public Guid Id { get; set; }
    public Guid ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsFreePreview { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public Chapter Chapter { get; set; } = null!;
}
