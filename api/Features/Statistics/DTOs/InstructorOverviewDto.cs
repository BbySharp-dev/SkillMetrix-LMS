namespace SkillMetrix_LMS.API.Features.Statistics.DTOs;

public class InstructorOverviewDto
{
    public int TotalCourses { get; set; }
    public int TotalStudents { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public int PublishedCourses { get; set; }
    public int PendingCourses { get; set; }
}
