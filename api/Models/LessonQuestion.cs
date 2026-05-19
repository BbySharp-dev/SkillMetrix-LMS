using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkillMetrix_LMS.API.Models;

public class LessonQuestion
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public Guid UserId { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Thời điểm trong video (giây) khi đặt câu hỏi.
    /// </summary>
    public int? VideoTimestampSeconds { get; set; }

    public int AnswerCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public ICollection<LessonAnswer> Answers { get; set; } = new List<LessonAnswer>();
}
