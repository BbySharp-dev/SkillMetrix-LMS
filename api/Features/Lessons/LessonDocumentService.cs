using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Models;
using SkillMetrix_LMS.API.Shared;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

public class LessonDocumentService(ApplicationDbContext context) : ILessonDocumentService
{
    private static readonly Dictionary<string, string> FileTypeLabels = new(StringComparer.OrdinalIgnoreCase)
    {
        ["pdf"] = "PDF",
        ["docx"] = "Word",
        ["doc"] = "Word",
        ["xlsx"] = "Excel",
        ["xls"] = "Excel",
        ["pptx"] = "PowerPoint",
        ["ppt"] = "PowerPoint",
        ["zip"] = "ZIP",
        ["rar"] = "RAR",
        ["mp4"] = "Video",
        ["mp3"] = "Audio",
        ["png"] = "Hình ảnh",
        ["jpg"] = "Hình ảnh",
        ["jpeg"] = "Hình ảnh",
        ["gif"] = "Hình ảnh",
        ["txt"] = "Text",
        ["html"] = "HTML",
        ["css"] = "CSS",
        ["js"] = "JavaScript",
        ["ts"] = "TypeScript",
        ["json"] = "JSON",
        ["xml"] = "XML",
    };

    private static string GetFileTypeLabel(string ext)
    {
        return FileTypeLabels.TryGetValue(ext.TrimStart('.'), out var label) ? label : ext.ToUpperInvariant();
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        if (bytes < 1024 * 1024 * 1024) return $"{bytes / (1024.0 * 1024):F1} MB";
        return $"{bytes / (1024.0 * 1024 * 1024):F1} GB";
    }

    public async Task<IEnumerable<LessonDocumentResponseDto>> GetByLessonIdAsync(Guid lessonId)
    {
        var docs = await context.LessonDocuments
            .Where(d => d.LessonId == lessonId && !d.IsDeleted)
            .OrderBy(d => d.OrderIndex)
            .AsNoTracking()
            .ToListAsync();

        return docs.Select(MapToDto);
    }

    public async Task<LessonDocumentResponseDto?> GetByIdAsync(Guid id)
    {
        var doc = await context.LessonDocuments
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

        return doc == null ? null : MapToDto(doc);
    }

    public async Task<LessonDocumentResponseDto> CreateAsync(Guid lessonId, CreateLessonDocumentDto dto)
    {
        var doc = new LessonDocument
        {
            Id = Guid.NewGuid(),
            LessonId = lessonId,
            FileName = dto.FileName,
            FileUrl = dto.FileUrl,
            FileType = dto.FileType,
            FileSizeBytes = dto.FileSizeBytes,
            Title = dto.Title,
            OrderIndex = dto.OrderIndex,
            CreatedAt = DateTime.UtcNow
        };

        context.LessonDocuments.Add(doc);
        await context.SaveChangesAsync();

        return MapToDto(doc);
    }

    public async Task<LessonDocumentResponseDto?> UpdateAsync(Guid id, UpdateLessonDocumentDto dto)
    {
        var doc = await context.LessonDocuments
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

        if (doc == null) return null;

        if (dto.Title != null) doc.Title = dto.Title;
        if (dto.OrderIndex.HasValue) doc.OrderIndex = dto.OrderIndex.Value;

        await context.SaveChangesAsync();

        return MapToDto(doc);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var doc = await context.LessonDocuments
            .FirstOrDefaultAsync(d => d.Id == id && !d.IsDeleted);

        if (doc == null) return false;

        doc.IsDeleted = true;
        await context.SaveChangesAsync();

        return true;
    }

    private static LessonDocumentResponseDto MapToDto(LessonDocument doc)
    {
        var ext = Path.GetExtension(doc.FileName).TrimStart('.');
        return new LessonDocumentResponseDto
        {
            Id = doc.Id,
            LessonId = doc.LessonId,
            FileName = doc.FileName,
            FileUrl = doc.FileUrl,
            FileType = doc.FileType,
            FileTypeLabel = GetFileTypeLabel(ext),
            FileSizeBytes = doc.FileSizeBytes,
            FormattedSize = FormatFileSize(doc.FileSizeBytes),
            Title = doc.Title,
            OrderIndex = doc.OrderIndex,
            CreatedAt = doc.CreatedAt
        };
    }
}
