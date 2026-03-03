namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class UpdateLessonDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public int? DurationSeconds { get; set; }
    public bool? IsFreePreview { get; set; }
}
