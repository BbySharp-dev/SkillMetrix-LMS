using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.Notes;

public class LessonNoteService(ApplicationDbContext context) : ILessonNoteService
{
    public async Task<IEnumerable<LessonNoteResponseDto>> GetByLessonAsync(Guid lessonId, Guid userId)
    {
        var notes = await context.LessonNotes
            .Where(n => n.LessonId == lessonId && n.UserId == userId)
            .OrderBy(n => n.VideoTimestampSeconds)
            .AsNoTracking()
            .ToListAsync();

        return notes.Select(MapToDto);
    }

    public async Task<LessonNoteResponseDto?> GetByIdAsync(Guid id)
    {
        var note = await context.LessonNotes
            .FirstOrDefaultAsync(n => n.Id == id);
        return note == null ? null : MapToDto(note);
    }

    public async Task<LessonNoteResponseDto> CreateAsync(Guid lessonId, Guid userId, CreateLessonNoteDto dto)
    {
        var note = new LessonNote
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            UserId = userId,
            Content = dto.Content,
            VideoTimestampSeconds = dto.VideoTimestampSeconds,
            CreatedAt = DateTime.UtcNow
        };

        context.LessonNotes.Add(note);
        await context.SaveChangesAsync();

        return MapToDto(note);
    }

    public async Task<LessonNoteResponseDto?> UpdateAsync(Guid id, Guid userId, UpdateLessonNoteDto dto)
    {
        var note = await context.LessonNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note == null) return null;

        note.Content = dto.Content;
        note.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return MapToDto(note);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var note = await context.LessonNotes
            .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

        if (note == null) return false;

        context.LessonNotes.Remove(note);
        await context.SaveChangesAsync();

        return true;
    }

    private static string FormatTimestamp(int seconds)
    {
        var ts = TimeSpan.FromSeconds(seconds);
        if (ts.Hours > 0)
            return $"{(int)ts.TotalHours}:{ts.Minutes:D2}:{ts.Seconds:D2}";
        return $"{ts.Minutes:D2}:{ts.Seconds:D2}";
    }

    private static LessonNoteResponseDto MapToDto(LessonNote note)
    {
        return new LessonNoteResponseDto
        {
            Id = note.Id,
            LessonId = note.LessonId,
            Content = note.Content,
            VideoTimestampSeconds = note.VideoTimestampSeconds,
            FormattedTimestamp = FormatTimestamp(note.VideoTimestampSeconds),
            CreatedAt = note.CreatedAt
        };
    }
}