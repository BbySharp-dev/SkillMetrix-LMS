namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class UpdateCourseDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public string? Thumbnail { get; set; }
    public Guid? InstructorId { get; set; }
}
