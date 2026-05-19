namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class LessonDocumentResponseDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string FileTypeLabel { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string FormattedSize { get; set; } = string.Empty;
    public string? Title { get; set; }
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateLessonDocumentDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string? Title { get; set; }
    public int OrderIndex { get; set; }
}

public class UpdateLessonDocumentDto
{
    public string? Title { get; set; }
    public int? OrderIndex { get; set; }
}
