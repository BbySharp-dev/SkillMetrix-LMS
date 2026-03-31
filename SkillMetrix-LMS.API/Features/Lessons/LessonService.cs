using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;
using SkillMetrix_LMS.API.Features.Upload;


namespace SkillMetrix_LMS.API.Features.Lessons;

public class LessonService(ApplicationDbContext context, IFileUploadService uploadService) : ILessonService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IFileUploadService _uploadService = uploadService;
    public async Task<Result<List<LessonResponseDto>>> GetLessonsByChapterAsync(Guid chapterId)
    {
        var lesson = await _context.Lessons
            .Where(ls => ls.ChapterId == chapterId && !ls.IsDeleted)
            .OrderBy(ls => ls.OrderIndex)
            .AsNoTracking()
            .ToListAsync();

        var dto = lesson.Select(ls => new LessonResponseDto
        {
            Id = ls.Id,
            ChapterId = ls.ChapterId,
            Title = ls.Title,
            Description = ls.Description,
            VideoUrl = ls.VideoUrl,
            DurationSeconds = ls.DurationSeconds,
            IsFreePreview = ls.IsFreePreview,
            OrderIndex = ls.OrderIndex,
            CreatedAt = ls.CreatedAt
        }).ToList();

        return dto;
    }
    public async Task<Result<LessonResponseDto>> CreateLessonAsync(Guid chapterId, CreateLessonDto dto, Guid actorId)
    {
        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.Id == chapterId && !ch.IsDeleted);

        if (chapter == null)
        {
            return Result<LessonResponseDto>.NotFound("Chapter not found");
        }

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == chapter.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<LessonResponseDto>.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result<LessonResponseDto>.Forbidden("You are not allowed to manage lessons of this course");
            }
        }

        var orderIndex = await _context.Lessons
            .Where(ls => ls.ChapterId == chapterId && !ls.IsDeleted).CountAsync() + 1;

        var lesson = new Lesson
        {
            Id = Guid.NewGuid(),
            ChapterId = chapterId,
            Title = dto.Title,
            Description = dto.Description,
            DurationSeconds = dto.DurationSeconds,
            IsFreePreview = dto.IsFreePreview,
            OrderIndex = orderIndex,
            CreatedAt = DateTime.UtcNow
        };
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return new LessonResponseDto
        {
            Id = lesson.Id,
            ChapterId = lesson.ChapterId,
            Title = lesson.Title,
            Description = lesson.Description,
            VideoUrl = lesson.VideoUrl,
            DurationSeconds = lesson.DurationSeconds,
            IsFreePreview = lesson.IsFreePreview,
            OrderIndex = lesson.OrderIndex,
            CreatedAt = lesson.CreatedAt
        };
    }

    public async Task<Result<LessonResponseDto>> UpdateLessonAsync(Guid id, UpdateLessonDto dto, Guid actorId)
    {
        var lesson = await _context.Lessons.FirstOrDefaultAsync(ls => ls.Id == id && !ls.IsDeleted);
        if (lesson == null)
        {
            return Result<LessonResponseDto>.NotFound("Lesson not found");
        }

        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.Id == lesson.ChapterId && !ch.IsDeleted);
        if (chapter == null)
        {
            return Result<LessonResponseDto>.NotFound("Lesson not found");
        }

        var course = await _context.Courses
           .FirstOrDefaultAsync(c => c.Id == chapter.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<LessonResponseDto>.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result<LessonResponseDto>.Forbidden("You are not allowed to update this lesson");
            }
        }

        if (dto.Title != null)
        {
            lesson.Title = dto.Title;
        }

        if (dto.Description != null)
        {
            lesson.Description = dto.Description;
        }


        if (dto.DurationSeconds.HasValue)
        {
            lesson.DurationSeconds = dto.DurationSeconds.Value;
        }

        if (dto.IsFreePreview.HasValue)
        {
            lesson.IsFreePreview = dto.IsFreePreview.Value;
        }

        lesson.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new LessonResponseDto
        {
            Id = lesson.Id,
            ChapterId = lesson.ChapterId,
            Title = lesson.Title,
            Description = lesson.Description,
            VideoUrl = lesson.VideoUrl,
            DurationSeconds = lesson.DurationSeconds,
            IsFreePreview = lesson.IsFreePreview,
            OrderIndex = lesson.OrderIndex,
            CreatedAt = lesson.CreatedAt
        };
    }
    public async Task<Result<LessonResponseDto>> UploadLessonVideoAsync(Guid lessonId, IFormFile file, Guid actorId)
    {
        if (file == null || file.Length == 0)
        {
            return Result<LessonResponseDto>.ValidationError("No file uploaded.");
        }

        var lesson = await _context.Lessons
            .FirstOrDefaultAsync(ls => ls.Id == lessonId && !ls.IsDeleted);

        if (lesson == null)
        {
            return Result<LessonResponseDto>.NotFound("Lesson not found");
        }

        var chapter = await _context.Chapters
            .FirstOrDefaultAsync(ch => ch.Id == lesson.ChapterId && !ch.IsDeleted);

        if (chapter == null)
        {
            return Result<LessonResponseDto>.NotFound("Chapter not found");
        }

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == chapter.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<LessonResponseDto>.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result<LessonResponseDto>.Forbidden("You are not allowed to upload video for this lesson");
            }
        }

        var folder = $"skillmetrix/courses/{course.Id}/chapters/{chapter.Id}/lessons/{lesson.Id}/videos";
        var uploadResult = await _uploadService.UploadVideoAsync(file, folder);
        if (!uploadResult.IsSuccess)
        {
            return Result<LessonResponseDto>.Failure(uploadResult.ErrorMessage ?? "Upload failed", uploadResult.ErrorType);
        }

        lesson.VideoUrl = uploadResult.Value;
        lesson.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new LessonResponseDto
        {
            Id = lesson.Id,
            ChapterId = lesson.ChapterId,
            Title = lesson.Title,
            Description = lesson.Description,
            VideoUrl = lesson.VideoUrl,
            DurationSeconds = lesson.DurationSeconds,
            IsFreePreview = lesson.IsFreePreview,
            OrderIndex = lesson.OrderIndex,
            CreatedAt = lesson.CreatedAt
        };
    }
    public async Task<Result> DeleteLessonAsync(Guid id, Guid actorId)
    {
        var lesson = await _context.Lessons
            .FirstOrDefaultAsync(ls => ls.Id == id && !ls.IsDeleted);

        if (lesson == null)
        {
            return Result.NotFound("Lesson not found");
        }

        var chapter = await _context.Chapters
            .FirstOrDefaultAsync(ch => ch.Id == lesson.ChapterId && !ch.IsDeleted);

        if (chapter == null)
        {
            return Result.NotFound("Chapter not found");
        }

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == chapter.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result.Forbidden("You are not allowed to delete this lesson");
            }
        }

        lesson.IsDeleted = true;
        lesson.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }
}