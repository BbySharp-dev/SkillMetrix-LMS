namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class CreateCourseDto
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string? Thumbnail { get; set; }

    public Guid InstructorId { get; set; }
}
