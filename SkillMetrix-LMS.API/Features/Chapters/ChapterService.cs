using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;
using SkillMetrix_LMS.API.DTOs.Responses;
using Microsoft.AspNetCore.Http.HttpResults;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Chapters;

public class ChapterService : IChapterService
{
    private readonly ApplicationDbContext _context;
    public ChapterService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ChapterResponseDto>>> GetChaptersByCourseAsync(Guid courseId)
    {
        var chapters = await _context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .OrderBy(ch => ch.OrderIndex)
            .AsNoTracking()
            .ToListAsync();

        var dto = chapters.Select(ch => new ChapterResponseDto
        {
            Id = ch.Id,
            CourseId = ch.CourseId,
            Title = ch.Title,
            Description = ch.Description,
            OrderIndex = ch.OrderIndex,
            CreatedAt = ch.CreatedAt
        }).ToList();

        return dto;
    }

    public async Task<Result<ChapterResponseDto>> CreateChapterAsync(Guid courseId, CreateChapterDto dto, Guid actorId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<ChapterResponseDto>.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result<ChapterResponseDto>.Forbidden("You are not allowed to manage chapters of this course");
            }
        }

        var oderIndex = await _context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .CountAsync() + 1;

        var chapter = new Chapter
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            Title = dto.Title,
            Description = dto.Description,
            OrderIndex = oderIndex,
            CreatedAt = DateTime.UtcNow
        };

        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();

        return new ChapterResponseDto
        {
            Id = chapter.Id,
            CourseId = chapter.CourseId,
            Title = chapter.Title,
            Description = chapter.Description,
            OrderIndex = chapter.OrderIndex,
            CreatedAt = chapter.CreatedAt
        };
    }

    public async Task<Result<ChapterResponseDto>> UpdateChapterAsync(Guid id, UpdateChapterDto dto, Guid actorId)
    {
        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.Id == id && !ch.IsDeleted);

        if (chapter == null)
        {
            return Result<ChapterResponseDto>.NotFound("Chapter not found");
        }

        var course = await _context.Courses.FirstOrDefaultAsync(ch => ch.Id == chapter.CourseId && !ch.IsDeleted);

        if (course == null)
        {
            return Result<ChapterResponseDto>.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result<ChapterResponseDto>.Forbidden("You are not allowed to update this chapter");
            }
        }

        if (dto.Title != null)
        {
            chapter.Title = dto.Title;
        }

        if (dto.Description != null)
        {
            chapter.Description = dto.Description;
        }

        chapter.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new ChapterResponseDto
        {
            Id = chapter.Id,
            CourseId = chapter.CourseId,
            Title = chapter.Title,
            Description = chapter.Description,
            OrderIndex = chapter.OrderIndex,
            CreatedAt = chapter.CreatedAt
        };

    }

    public async Task<Result> DeleteChapterAsync(Guid id, Guid actorId)
    {
        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.Id == id && !ch.IsDeleted);

        if (chapter == null)
        {
            return Result.NotFound("Chapter not found");
        }

        var course = await _context.Courses.FirstOrDefaultAsync(ch => ch.Id == chapter.CourseId && !ch.IsDeleted);

        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
            if (actor?.Role != UserRole.Admin)
            {
                return Result.Forbidden("You are not allowed to delete this chapter");
            }
        }

        chapter.IsDeleted = true;
        chapter.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<(Course? Course, bool CanManage)> GetCourseForManagementAsync(Guid courseId, Guid actorId)
    {
        var course = await _context.Courses
        .AsNoTracking()
        .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

        if (course == null)
        {
            return (null, false);
        }

        if (course.InstructorId == actorId)
        {
            return (course, true);
        }

        var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
        return (course, actor?.Role == UserRole.Admin);
    }

    public async Task<Result> ReorderChapterAsync(Guid courseId, Guid chapterId, ReorderDto dto, Guid actorId)
    {
        var (course, canManage) = await GetCourseForManagementAsync(courseId, actorId);
        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        if (!canManage)
        {
            return Result.Forbidden("You are not allowed to reorder this course");
        }

        var chapters = await _context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .OrderBy(ch => ch.OrderIndex)
            .ToListAsync();

        var currentIndex = chapters.FindIndex(ch => ch.Id == chapterId);
        if (currentIndex == -1)
        {
            return Result.NotFound("Chapter not found");
        }

        if (dto.NewIndex < 0 || dto.NewIndex >= chapters.Count)
        {
            return Result.ValidationError("NewIndex out of range");
        }

        var chapter = chapters[currentIndex];
        chapters.RemoveAt(currentIndex);
        chapters.Insert(dto.NewIndex, chapter);

        for (var i = 0; i < chapters.Count; i++)
        {
            chapters[i].OrderIndex = i + 1;
        }

        await _context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result<List<ChapterWithLessonsDto>>> GetCurriculumAsync(Guid courseId)
    {
        var chapter = await _context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .Include(ch => ch.Lessons)
            .OrderBy(ch => ch.OrderIndex)
            .AsNoTracking()
            .ToListAsync();

        var dto = chapter.Select(ch => new ChapterWithLessonsDto
        {
            Id = ch.Id,
            CourseId = ch.CourseId,
            Title = ch.Title,
            Description = ch.Description,
            OrderIndex = ch.OrderIndex,
            Lessons = ch.Lessons
                .Where(ls => !ls.IsDeleted)
                .OrderBy(ls => ls.OrderIndex)
                .Select(ls => new LessonResponseDto
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
                }).ToList()
        }).ToList();
        return dto;
    }
}

