namespace SkillMetrix_LMS.API.Features.Transactions.DTOs;

public class TransactionResponseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? EnrollmentId { get; set; }
    public Guid? CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public TransactionStatus Status { get; set; }
    public string? Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

}
