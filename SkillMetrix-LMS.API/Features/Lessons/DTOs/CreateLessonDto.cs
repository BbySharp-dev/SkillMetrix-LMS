namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class CreateLessonDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int DurationSeconds { get; set; }
    public bool IsFreePreview { get; set; }
}
