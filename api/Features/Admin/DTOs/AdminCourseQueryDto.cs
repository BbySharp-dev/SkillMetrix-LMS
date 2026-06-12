namespace SkillMetrix_LMS.API.Features.Admin.DTOs;

public class AdminCourseQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public CourseStatus? Status { get; set; }
    public bool IncludeDeleted { get; set; } = false;
}