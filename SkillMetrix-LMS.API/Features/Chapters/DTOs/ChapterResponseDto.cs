namespace SkillMetrix_LMS.API.Features.Chapters.DTOs;

public class ChapterResponseDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
}
