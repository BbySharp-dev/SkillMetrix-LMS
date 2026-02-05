using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SkillMetrix_LMS.API.Models.Enums;

namespace SkillMetrix_LMS.API.Models;

public class Course
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string? Thumbnail { get; set; }

    [Required]
    public Guid InstructorId { get; set; }

    [Required]
    public CourseStatus Status { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    public DateTime? PublishedAt { get; set; }

    [Column(TypeName = "decimal(3,2)")]
    public decimal? Rating { get; set; }

    public int? DurationMinutes { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }

    public User Instructor { get; set; } = null!;
    public ICollection<Chapter> Chapters { get; set; } = new List<Chapter>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
