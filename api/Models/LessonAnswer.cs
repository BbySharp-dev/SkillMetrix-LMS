using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkillMetrix_LMS.API.Models;

public class LessonAnswer
{
    public Guid Id { get; set; }

    public Guid QuestionId { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(QuestionId))]
    public LessonQuestion Question { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
