namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class LessonResponseDto
{
    public Guid Id { get; set; }
    public Guid ChapterId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoUrl { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsFreePreview { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
}
