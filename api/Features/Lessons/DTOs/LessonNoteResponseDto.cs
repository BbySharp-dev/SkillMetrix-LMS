namespace SkillMetrix_LMS.API.Features.Lessons.DTOs;

public class LessonNoteResponseDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string Content { get; set; } = string.Empty;
    public int VideoTimestampSeconds { get; set; }
    public string FormattedTimestamp { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateLessonNoteDto
{
    public string Content { get; set; } = string.Empty;
    public int VideoTimestampSeconds { get; set; }
}

public class UpdateLessonNoteDto
{
    public string Content { get; set; } = string.Empty;
}
