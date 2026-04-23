namespace SkillMetrix_LMS.API.Features.Chapters.DTOs;

public class CreateChapterDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
}
