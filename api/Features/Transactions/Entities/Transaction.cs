namespace SkillMetrix_LMS.API.Features.Transactions.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? EnrollmentId { get; set; }
    public Guid? CourseId { get; set; }
    public decimal Amount { get; set; }

    [Column(TypeName = "smallint")]
    public TransactionType Type { get; set; }

    [Column(TypeName = "smallint")]
    public TransactionStatus Status { get; set; }
    [MaxLength(1000)]
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public Enrollment? Enrollment { get; set; }
    public Course? Course { get; set; }
}