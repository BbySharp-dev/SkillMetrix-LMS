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

    public async Task<Result<PagedResponse<List<InstructorCourseDto>>>> GetInstructorCoursesAsync(Guid instructorId, InstructorCourseQueryDto query)
    {
        var instructor = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == instructorId && u.Role == UserRole.Instructor);

        if (instructor == null)
            return Result<PagedResponse<List<InstructorCourseDto>>>.NotFound("Không tìm thấy giảng viên.");

        var baseQuery = context.Courses
            .AsNoTracking()
            .Where(c => c.InstructorId == instructorId && !c.IsDeleted);

        if (!string.IsNullOrEmpty(query.Status) && Enum.TryParse<CourseStatus>(query.Status, true, out var courseStatus))
        {
            baseQuery = baseQuery.Where(c => c.Status == courseStatus);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            baseQuery = baseQuery.Where(c => c.Title.Contains(keyword) || c.Description.Contains(keyword));
        }

        var totalCount = await baseQuery.CountAsync();

        baseQuery = query.SortBy?.ToLower() switch
        {
            "title" => baseQuery.OrderBy(c => c.Title),
            "price" => baseQuery.OrderByDescending(c => c.Price),
            "rating" => baseQuery.OrderByDescending(c => c.Rating),
            "oldest" => baseQuery.OrderBy(c => c.CreatedAt),
            _ => baseQuery.OrderByDescending(c => c.CreatedAt)
        };

        var courses = await baseQuery
            .Include(c => c.Chapters)
                .ThenInclude(ch => ch.Lessons)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var courseIds = courses.Select(c => c.Id).ToList();
        var enrollmentCounts = await context.Enrollments
            .AsNoTracking()
            .Where(e => courseIds.Contains(e.CourseId))
            .GroupBy(e => e.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        var result = courses.Select(c => new InstructorCourseDto
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

        return new PagedResponse<List<InstructorCourseDto>>(result, query.PageNumber, query.PageSize, totalCount);
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

    public async Task<Result<PagedResponse<List<StudentEnrollmentDto>>>> GetStudentEnrollmentsAsync(Guid studentId, StudentEnrollmentQueryDto query)
    {
        var student = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == studentId);

        if (student == null)
            return Result<PagedResponse<List<StudentEnrollmentDto>>>.NotFound("Không tìm thấy học viên.");

        var baseQuery = context.Enrollments
            .AsNoTracking()
            .Where(e => e.UserId == studentId)
            .Include(e => e.Course)
                .ThenInclude(c => c.Chapters)
                    .ThenInclude(ch => ch.Lessons)
            .Include(e => e.Course)
                .ThenInclude(c => c.Instructor)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            baseQuery = baseQuery.Where(e =>
                e.Course.Title.Contains(keyword) ||
                (e.Course.Instructor != null && e.Course.Instructor.FullName.Contains(keyword)));
        }

        var totalCount = await baseQuery.CountAsync();

        var allEnrollments = await baseQuery.ToListAsync();

        var sortedEnrollments = query.SortBy?.ToLower() switch
        {
            "title" => allEnrollments.OrderBy(e => e.Course.Title).ToList(),
            "price" => allEnrollments.OrderByDescending(e => e.PricePaid).ToList(),
            "oldest" => allEnrollments.OrderBy(e => e.EnrolledAt).ToList(),
            _ => allEnrollments.OrderByDescending(e => e.EnrolledAt).ToList()
        };

        var pagedEnrollments = sortedEnrollments
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToList();

        var courseLessonIds = pagedEnrollments
            .SelectMany(e => e.Course.Chapters.SelectMany(ch => ch.Lessons))
            .Select(l => l.Id)
            .ToHashSet();

        var completedLessonIds = await context.UserLessonProgresses
            .AsNoTracking()
            .Where(p => p.UserId == studentId && p.IsCompleted && courseLessonIds.Contains(p.LessonId))
            .Select(p => p.LessonId)
            .ToListAsync();

        var completedLessonIdSet = completedLessonIds.ToHashSet();

        var dto = pagedEnrollments.Select(e =>
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
        }).ToList();

        return new PagedResponse<List<StudentEnrollmentDto>>(dto, query.PageNumber, query.PageSize, totalCount);
    }
}