using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Models;
using SkillMetrix_LMS.API.Features.Profiles.DTOs;

namespace SkillMetrix_LMS.API.Features.Profiles;

public class ProfileService(ApplicationDbContext context) : IProfileService
{
    // ─── Instructor Profile ─────────────────────────────────────────────────

    public async Task<Result<InstructorProfileDto>> GetInstructorProfileAsync(Guid instructorId)
    {
        var instructor = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == instructorId && u.Role == UserRole.Instructor);

        if (instructor == null)
            return Result<InstructorProfileDto>.NotFound("Không tìm thấy giảng viên.");

        var courses = await context.Courses
            .AsNoTracking()
            .Where(c => c.InstructorId == instructorId && !c.IsDeleted)
            .ToListAsync();

        var publishedCourses = courses.Where(c => c.Status == CourseStatus.Published).ToList();
        var totalStudents = await context.Enrollments
            .AsNoTracking()
            .CountAsync(e => publishedCourses.Select(c => c.Id).Contains(e.CourseId));

        var totalLessons = await context.Chapters
            .AsNoTracking()
            .Where(c => publishedCourses.Select(p => p.Id).Contains(c.CourseId))
            .SelectMany(c => c.Lessons)
            .CountAsync();

        var avgRating = publishedCourses.Any()
            ? publishedCourses.Where(c => c.Rating.HasValue).Select(c => c.Rating!.Value).DefaultIfEmpty(0).Average()
            : (decimal?)null;

        return new InstructorProfileDto
        {
            Id = instructor.Id,
            FullName = instructor.FullName,
            Email = instructor.Email ?? string.Empty,
            AvatarUrl = instructor.AvatarUrl,
            Bio = $"Giảng viên {instructor.FullName} - Chuyên gia trong lĩnh vực.",
            CreatedAt = instructor.CreatedAt,
            TotalCourses = courses.Count,
            PublishedCourses = publishedCourses.Count,
            TotalStudents = totalStudents,
            AverageRating = avgRating.HasValue ? Math.Round(avgRating.Value, 1) : null,
            TotalLessons = totalLessons,
        };
    }

    public async Task<Result<List<InstructorCourseDto>>> GetInstructorCoursesAsync(Guid instructorId, string? status = null)
    {
        var instructor = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == instructorId && u.Role == UserRole.Instructor);

        if (instructor == null)
            return Result<List<InstructorCourseDto>>.NotFound("Không tìm thấy giảng viên.");

        var query = context.Courses
            .AsNoTracking()
            .Where(c => c.InstructorId == instructorId && !c.IsDeleted);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<CourseStatus>(status, true, out var courseStatus))
        {
            query = query.Where(c => c.Status == courseStatus);
        }

        var courses = await query
            .Include(c => c.Chapters)
                .ThenInclude(ch => ch.Lessons)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var courseIds = courses.Select(c => c.Id).ToList();
        var enrollmentCounts = await context.Enrollments
            .AsNoTracking()
            .Where(e => courseIds.Contains(e.CourseId))
            .GroupBy(e => e.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        return courses.Select(c => new InstructorCourseDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            Thumbnail = c.Thumbnail,
            Status = c.Status.ToString(),
            Rating = c.Rating,
            EnrollmentCount = enrollmentCounts.GetValueOrDefault(c.Id, 0),
            LessonCount = c.Chapters.SelectMany(ch => ch.Lessons).Count(),
            DurationMinutes = c.DurationMinutes ?? 0,
            CreatedAt = c.CreatedAt,
            PublishedAt = c.PublishedAt,
        }).ToList();
    }

    // ─── Student Profile ─────────────────────────────────────────────────

    public async Task<Result<StudentProfileDto>> GetStudentProfileAsync(Guid studentId)
    {
        var student = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == studentId);

        if (student == null)
        {
            return Result<StudentProfileDto>.NotFound("Không tìm thấy học viên.");
        }


        var enrollments = await context.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == studentId)
            .Include(e => e.Course)
                .ThenInclude(c => c.Chapters)
                    .ThenInclude(ch => ch.Lessons)
            .ToListAsync();

        var completedCount = enrollments.Count(e =>
            e.Course.Status == CourseStatus.Published &&
            e.Course.Chapters.SelectMany(ch => ch.Lessons).Any() &&
            e.Course.Chapters.SelectMany(ch => ch.Lessons).Count() > 0);

        var lessonIds = enrollments
            .SelectMany(e => e.Course.Chapters.SelectMany(ch => ch.Lessons))
            .Select(l => l.Id)
            .ToList();

        var completedLessons = await context.UserLessonProgresses
            .AsNoTracking()
            .CountAsync(p => p.UserId == studentId && lessonIds.Contains(p.LessonId) && p.IsCompleted);

        var totalSpent = enrollments.Sum(e => e.PricePaid);

        return new StudentProfileDto
        {
            Id = student.Id,
            FullName = student.FullName,
            Email = student.Email ?? string.Empty,
            AvatarUrl = student.AvatarUrl,
            CreatedAt = student.CreatedAt,
            TotalEnrolledCourses = enrollments.Count,
            CompletedCourses = completedCount,
            TotalLessonsCompleted = completedLessons,
            TotalSpent = totalSpent,
        };
    }

    public async Task<Result<List<StudentEnrollmentDto>>> GetStudentEnrollmentsAsync(Guid studentId)
    {
        var student = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == studentId);

        if (student == null)
            return Result<List<StudentEnrollmentDto>>.NotFound("Không tìm thấy học viên.");

        var enrollments = await context.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == studentId)
            .Include(e => e.Course)
                .ThenInclude(c => c.Chapters)
                    .ThenInclude(ch => ch.Lessons)
            .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
            .ToListAsync();

        var enrollmentIds = enrollments.Select(e => e.Id).ToList();
        
        // Get completed lessons for this student's courses
        var courseLessonIds = enrollments
            .SelectMany(e => e.Course.Chapters.SelectMany(ch => ch.Lessons))
            .Select(l => l.Id)
            .ToHashSet();

        var completedLessonIds = await context.UserLessonProgresses
            .AsNoTracking()
            .Where(p => p.UserId == studentId && p.IsCompleted && courseLessonIds.Contains(p.LessonId))
            .Select(p => p.LessonId)
            .ToListAsync();

        var completedLessonIdSet = completedLessonIds.ToHashSet();

        return enrollments.Select(e =>
        {
            var lessonIds = e.Course.Chapters.SelectMany(ch => ch.Lessons).Select(l => l.Id).ToList();
            var totalLessons = lessonIds.Count;
            var completedLessons = lessonIds.Count(l => completedLessonIdSet.Contains(l));
            var completionPercent = totalLessons > 0
                ? (int)Math.Round((completedLessons * 100.0) / totalLessons)
                : 0;

            return new StudentEnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                CourseThumbnail = e.Course.Thumbnail,
                PricePaid = e.PricePaid,
                EnrolledAt = e.EnrolledAt,
                CompletedLessons = completedLessons,
                TotalLessons = totalLessons,
                CompletionPercent = completionPercent,
                InstructorName = e.Course.Instructor?.FullName ?? string.Empty,
            };
        }).OrderByDescending(e => e.EnrolledAt).ToList();
    }
}
