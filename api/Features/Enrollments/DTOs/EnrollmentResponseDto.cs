namespace SkillMetrix_LMS.API.Features.Enrollments.DTOs;

public class EnrollmentResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public decimal PricePaid { get; set; }
    public DateTime EnrolledAt { get; set; }
    public int TotalLessons { get; set; }
    public int CompletedLessons { get; set; }
    public double CompletionPercent { get; set; }
}