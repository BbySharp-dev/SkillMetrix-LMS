namespace SkillMetrix_LMS.API.Features.Admin.DTOs;

public class AdminCourseListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Thumbnail { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal Rating { get; set; }
    public string? RejectionReason { get; set; }
}
