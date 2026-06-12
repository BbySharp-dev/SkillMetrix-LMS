namespace SkillMetrix_LMS.API.Features.Statistics.DTOs;

public class CoursePerformanceDto
{
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public decimal TotalRevenue { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int LessonCount { get; set; }
}