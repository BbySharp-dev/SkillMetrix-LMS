namespace SkillMetrix_LMS.API.Features.Reviews.Entities;

public class CourseReview
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }

    [Column(TypeName = "smallint")]
    public int Rating { get; set; }
    [MaxLength(1000)]
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }

    public Course Course { get; set; } = null!;
    public User User { get; set; } = null!;
}