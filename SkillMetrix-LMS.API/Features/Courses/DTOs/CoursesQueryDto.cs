namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class CourseQueryDto
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public Guid? InstructorId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; }
}
