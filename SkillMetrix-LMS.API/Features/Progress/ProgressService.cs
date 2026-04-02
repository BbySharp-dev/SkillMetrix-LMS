using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Features.Progress.DTOs;
using SkillMetrix_LMS.API.Infrastructure.Persistence;

namespace SkillMetrix_LMS.API.Features.Progress;

public class ProgressService : IProgressService
{
    private readonly ApplicationDbContext _context;

    public ProgressService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LessonProgressDto>> UpdateLessonProgressAsync(Guid lessonId, Guid userId, UpdateProgressDto dto)
    {
        var lesson = await _context.Lessons
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.Id == lessonId && !l.IsDeleted);

        if (lesson == null)
        {
            return Result<LessonProgressDto>.NotFound("Lesson not found");
        }

        var courseId = await _context.Chapters
            .Where(ch => ch.Id == lesson.ChapterId)
            .Select(ch => ch.CourseId)
            .FirstOrDefaultAsync();

        var isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

        if (!isEnrolled)
        {
            return Result<LessonProgressDto>.Forbidden("You are not enrolled in this course");
        }

        var progress = await _context.UserLessonProgresses
            .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

        if (progress == null)
        {
            progress = new Models.UserLessonProgress
            {
                UserId = userId,
                LessonId = lessonId,
                LastWatchedSecond = dto.LastWatchedSecond,
                IsCompleted = false,
                LastUpdatedAt = DateTime.UtcNow
            };

            _context.UserLessonProgresses.Add(progress);
        }
        else
        {
            progress.LastWatchedSecond = Math.Max(dto.LastWatchedSecond, progress.LastWatchedSecond);
            progress.LastUpdatedAt = DateTime.UtcNow;
        }

        var completedThreshold = (int)Math.Ceiling(lesson.DurationSeconds * 0.9);
        if (!progress.IsCompleted && progress.LastWatchedSecond >= completedThreshold)
        {
            progress.IsCompleted = true;
            progress.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return new LessonProgressDto
        {
            LessonId = progress.LessonId,
            IsCompleted = progress.IsCompleted,
            LastWatchedSecond = progress.LastWatchedSecond,
            CompletedAt = progress.CompletedAt,
            LastUpdatedAt = progress.LastUpdatedAt
        };
    }

    public async Task<Result<LessonProgressDto>> GetLessonProgressAsync(Guid lessonId, Guid userId)
    {
        var progress = await _context.UserLessonProgresses
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId && p.LessonId == lessonId);

        if (progress == null)
        {
            return Result<LessonProgressDto>.NotFound("Progress not found");
        }

        return new LessonProgressDto
        {
            LessonId = progress.LessonId,
            IsCompleted = progress.IsCompleted,
            LastWatchedSecond = progress.LastWatchedSecond,
            CompletedAt = progress.CompletedAt,
            LastUpdatedAt = progress.LastUpdatedAt
        };
    }

    public async Task<Result<CourseProgressDto>> GetCourseProgressAsync(Guid courseId, Guid userId)
    {
        var isEnrolled = await _context.Enrollments
            .AnyAsync(e => e.CourseId == courseId && e.UserId == userId);

        if (!isEnrolled)
        {
            return Result<CourseProgressDto>.Forbidden("You are not enrolled in this course");
        }

        var totalLessons = await _context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .SelectMany(ch => ch.Lessons.Where(ls => !ls.IsDeleted))
            .CountAsync();

        var completedLessons = await _context.UserLessonProgresses
            .Include(p => p.Lesson)
            .CountAsync(p =>
                p.UserId == userId &&
                p.IsCompleted &&
                !p.Lesson.IsDeleted &&
                p.Lesson.Chapter.CourseId == courseId);

        var completionPercent = totalLessons == 0
            ? 0
            : Math.Round((completedLessons * 100.0) / totalLessons, 2);

        return new CourseProgressDto
        {
            CourseId = courseId,
            TotalLessons = totalLessons,
            CompletedLessons = completedLessons,
            CompletionPercent = completionPercent
        };
    }
}