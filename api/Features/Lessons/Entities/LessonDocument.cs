namespace SkillMetrix_LMS.API.Features.Lessons.Entities;

public class LessonDocument
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    [MaxLength(300)]
    public string FileName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string FileUrl { get; set; } = string.Empty;

    [MaxLength(50)]
    public string FileType { get; set; } = string.Empty; // pdf, zip, mp4, docx, etc.

    public long FileSizeBytes { get; set; }

    [MaxLength(200)]
    public string? Title { get; set; }

    public int OrderIndex { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;

    [ForeignKey(nameof(LessonId))]
    public Lesson Lesson { get; set; } = null!;
}