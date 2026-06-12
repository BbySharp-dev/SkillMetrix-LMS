using SkillMetrix_LMS.API.Features.Enrollments.DTOs;

namespace SkillMetrix_LMS.API.Features.Enrollments;

public class EnrollmentService(ApplicationDbContext context) : IEnrollmentService
{
    public async Task<Result<EnrollmentResponseDto>> EnrollAsync(Guid userId, CreateEnrollmentDto dto)
    {
        var course = await context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == dto.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<EnrollmentResponseDto>.NotFound("Course not found");
        }

        if (course.Status != CourseStatus.Published)
        {
            return Result<EnrollmentResponseDto>.BusinessRule("Course is not published");
        }

        var exists = await context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == dto.CourseId);

        if (exists)
        {
            return Result<EnrollmentResponseDto>.BusinessRule("Already enrolled");
        }

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = dto.CourseId,
            PricePaid = course.Price,
            EnrolledAt = DateTime.UtcNow
        };

        context.Enrollments.Add(enrollment);

        if (course.Price > 0)
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EnrollmentId = enrollment.Id,
                CourseId = course.Id,
                Amount = course.Price,
                Type = TransactionType.Purchase,
                Status = TransactionStatus.Completed,
                Description = "Thanh toán cho khóa học",
                CreatedAt = DateTime.UtcNow
            };

            context.Transactions.Add(transaction);
        }

        await context.SaveChangesAsync();

        return new EnrollmentResponseDto
        {
            Id = enrollment.Id,
            UserId = enrollment.UserId,
            CourseId = enrollment.CourseId,
            CourseTitle = course.Title,
            CourseThumbnail = course.Thumbnail,
            InstructorName = (await context.Users.FindAsync(course.InstructorId))?.FullName ?? "Giảng viên",
            PricePaid = enrollment.PricePaid,
            EnrolledAt = enrollment.EnrolledAt,
            TotalLessons = 0,
            CompletedLessons = 0,
            CompletionPercent = 0
        };
    }

    public async Task<Result<PagedResponse<List<EnrollmentResponseDto>>>> GetUserEnrollmentsAsync(Guid userId, EnrollmentQueryDto query)
    {
        var baseQuery = context.Enrollments
            .Include(e => e.Course)
            .ThenInclude(c => c.Instructor)
            .Where(e => e.UserId == userId)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            baseQuery = baseQuery.Where(e =>
                e.Course.Title.Contains(keyword) ||
                e.Course.Instructor.FullName.Contains(keyword));
        }

        var totalCount = await baseQuery.CountAsync();

        baseQuery = query.SortBy?.ToLower() switch
        {
            "title" => baseQuery.OrderBy(e => e.Course.Title),
            "price" => baseQuery.OrderByDescending(e => e.PricePaid),
            "oldest" => baseQuery.OrderBy(e => e.EnrolledAt),
            _ => baseQuery.OrderByDescending(e => e.EnrolledAt)
        };

        var enrollments = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dto = new List<EnrollmentResponseDto>();
        foreach (var e in enrollments)
        {
            var totalLessons = await context.Chapters
                .Where(ch => ch.CourseId == e.CourseId && !ch.IsDeleted)
                .SelectMany(ch => ch.Lessons.Where(ls => !ls.IsDeleted))
                .CountAsync();

            var completedLessons = await context.UserLessonProgresses
                .CountAsync(p => p.UserId == userId && p.IsCompleted && p.Lesson.Chapter.CourseId == e.CourseId && !p.Lesson.IsDeleted);

            dto.Add(new EnrollmentResponseDto
            {
                Id = e.Id,
                UserId = e.UserId,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                CourseThumbnail = e.Course.Thumbnail,
                InstructorName = e.Course.Instructor.FullName,
                PricePaid = e.PricePaid,
                EnrolledAt = e.EnrolledAt,
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                CompletionPercent = totalLessons == 0 ? 0 : Math.Round((completedLessons * 100.0) / totalLessons, 2)
            });
        }

        return new PagedResponse<List<EnrollmentResponseDto>>(dto, query.PageNumber, query.PageSize, totalCount);
    }



    public async Task<Result<bool>> CheckEnrollmentAsync(Guid userId, Guid courseId)
    {
        var exists = await context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);

        return exists;
    }
}