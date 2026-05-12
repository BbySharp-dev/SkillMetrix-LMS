namespace SkillMetrix_LMS.API.Features.Statistics.DTOs;

public class RecentActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // enrollment | review | rating
    public string StudentName { get; set; } = string.Empty;
    public string CourseTitle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
