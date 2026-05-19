using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkillMetrix_LMS.API.Models;

public class LessonNote
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public Guid UserId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Thời điểm trong video (giây) khi ghi chú được tạo.
    /// </summary>
    public int VideoTimestampSeconds { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
