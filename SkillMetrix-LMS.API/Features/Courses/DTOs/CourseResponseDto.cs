namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class CourseResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Thumbnail { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public int ChapterCount { get; set; }
    public int EnrollmentCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
