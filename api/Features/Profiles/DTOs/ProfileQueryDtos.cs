namespace SkillMetrix_LMS.API.Features.Profiles.DTOs;

public class InstructorCourseQueryDto
{
    public string? Search { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class StudentEnrollmentQueryDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
