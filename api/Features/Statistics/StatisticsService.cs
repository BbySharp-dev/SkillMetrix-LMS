using SkillMetrix_LMS.API.Features.Admin.DTOs;
using SkillMetrix_LMS.API.Features.Statistics.DTOs;

namespace SkillMetrix_LMS.API.Features.Statistics;

public class StatisticsService(ApplicationDbContext context) : IStatisticsService
{
    public async Task<Result<InstructorOverviewDto>> GetInstructorOverviewAsync(Guid instructorId)
    {
        var instructorCourses = context.Courses
            .Where(c => !c.IsDeleted && c.InstructorId == instructorId);

        var totalCourses = await instructorCourses.CountAsync();
        var publishedCourses = await instructorCourses.CountAsync(c => c.Status == CourseStatus.Published);
        var pendingCourses = await instructorCourses.CountAsync(c => c.Status == CourseStatus.Pending);

        var courseIds = await instructorCourses.Select(c => c.Id).ToListAsync();

        var totalStudents = await context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Select(e => e.UserId)
            .Distinct()
            .CountAsync();

        var totalRevenue = await context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .SumAsync(e => (decimal?)e.PricePaid) ?? 0m;

        var averageRating = await instructorCourses
            .Select(c => c.Rating)
            .DefaultIfEmpty(0)
            .AverageAsync();

        return new InstructorOverviewDto
        {
            TotalCourses = totalCourses,
            TotalStudents = totalStudents,
            TotalRevenue = totalRevenue,
            AverageRating = averageRating > 0 ? Math.Round((double)averageRating, 2) : 0,
            PublishedCourses = publishedCourses,
            PendingCourses = pendingCourses
        };
    }

    public async Task<Result<List<RevenuePointDto>>> GetInstructorRevenueAsync(Guid instructorId, int months = 12)
    {
        var fromDate = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1).AddMonths(-(months - 1));

        var courseIds = await context.Courses
            .Where(c => !c.IsDeleted && c.InstructorId == instructorId)
            .Select(c => c.Id)
            .ToListAsync();

        var revenueByMonth = await context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId) && e.EnrolledAt >= fromDate)
            .GroupBy(e => new { e.EnrolledAt.Year, e.EnrolledAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Revenue = g.Sum(e => e.PricePaid),
                OrderCount = g.Count()
            })
            .ToListAsync();

        var result = new List<RevenuePointDto>();
        for (int i = 0; i < months; i++)
        {
            var monthDate = fromDate.AddMonths(i);
            var item = revenueByMonth.FirstOrDefault(x => x.Year == monthDate.Year && x.Month == monthDate.Month);

            result.Add(new RevenuePointDto
            {
                Month = $"{monthDate:yyyy-MM}",
                Revenue = item?.Revenue ?? 0m,
                OrderCount = item?.OrderCount ?? 0
            });
        }

        return result;
    }

    public async Task<Result<List<RecentActivityDto>>> GetRecentActivityAsync(Guid instructorId, int limit = 10)
    {
        var courseIds = await context.Courses
            .Where(c => !c.IsDeleted && c.InstructorId == instructorId)
            .Select(c => c.Id)
            .ToListAsync();

        var enrollments = context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .Include(e => e.User)
            .Include(e => e.Course)
            .OrderByDescending(e => e.EnrolledAt)
            .Take(limit)
            .Select(e => new RecentActivityDto
            {
                Id = e.Id.ToString(),
                Type = "enrollment",
                StudentName = e.User.FullName,
                CourseTitle = e.Course.Title,
                CreatedAt = e.EnrolledAt
            });

        var reviews = context.CourseReviews
            .Where(r => courseIds.Contains(r.CourseId) && !r.IsDeleted)
            .Include(r => r.User)
            .Include(r => r.Course)
            .OrderByDescending(r => r.CreatedAt)
            .Take(limit)
            .Select(r => new RecentActivityDto
            {
                Id = r.Id.ToString(),
                Type = r.Rating >= 4 ? "rating" : "review",
                StudentName = r.User.FullName,
                CourseTitle = r.Course.Title,
                CreatedAt = r.CreatedAt
            });

        var allActivities = await enrollments
            .Union(reviews)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .ToListAsync();

        return Result<List<RecentActivityDto>>.Success(allActivities);
    }

    public async Task<Result<List<CoursePerformanceDto>>> GetCoursePerformanceAsync(Guid instructorId, Guid? courseId = null)
    {
        var query = context.Courses
            .Where(c => !c.IsDeleted && c.InstructorId == instructorId);

        if (courseId.HasValue)
            query = query.Where(c => c.Id == courseId.Value);

        var courseIdList = await query.Select(c => c.Id).ToListAsync();

        var reviewCounts = await context.CourseReviews
            .Where(r => courseIdList.Contains(r.CourseId) && !r.IsDeleted)
            .GroupBy(r => r.CourseId)
            .Select(g => new { CourseId = g.Key, ReviewCount = g.Count(), AvgRating = g.Average(r => r.Rating) })
            .ToDictionaryAsync(x => x.CourseId, x => new { x.ReviewCount, x.AvgRating });

        var courses = await query
            .Include(c => c.Enrollments)
            .Include(c => c.Chapters)
                .ThenInclude(ch => ch.Lessons)
            .ToListAsync();

        var result = courses.Select(c => new CoursePerformanceDto
        {
            CourseId = c.Id,
            CourseTitle = c.Title,
            TotalStudents = c.Enrollments.Count,
            TotalRevenue = c.Enrollments.Sum(e => e.PricePaid),
            AverageRating = c.Rating.HasValue ? (double)c.Rating.Value : 0,
            ReviewCount = reviewCounts.TryGetValue(c.Id, out var rc) ? rc.ReviewCount : 0,
            LessonCount = c.Chapters.SelectMany(ch => ch.Lessons).Count(l => !l.IsDeleted)
        }).ToList();

        return Result<List<CoursePerformanceDto>>.Success(result);
    }

    public async Task<Result<AdminOverviewDto>> GetAdminOverviewAsync()
    {
        var totalUsers = await context.Users.CountAsync();
        var totalCourses = await context.Courses.Where(c => !c.IsDeleted).CountAsync();
        var totalEnrollments = await context.Enrollments.CountAsync();

        var totalRevenue = await context.Enrollments
            .SumAsync(e => (decimal?)e.PricePaid) ?? 0m;

        var totalStudents = await context.Users.CountAsync(u => u.Role == UserRole.Student);
        var totalInstructors = await context.Users.CountAsync(u => u.Role == UserRole.Instructor);
        var totalAdmins = await context.Users.CountAsync(u => u.Role == UserRole.Admin);

        var draftCourses = await context.Courses.CountAsync(c => !c.IsDeleted && c.Status == CourseStatus.Draft);
        var pendingCourses = await context.Courses.CountAsync(c => !c.IsDeleted && c.Status == CourseStatus.Pending);
        var publishedCourses = await context.Courses.CountAsync(c => !c.IsDeleted && c.Status == CourseStatus.Published);
        var rejectedCourses = await context.Courses.CountAsync(c => !c.IsDeleted && c.Status == CourseStatus.Rejected);

        return new AdminOverviewDto
        {
            TotalUsers = totalUsers,
            TotalCourses = totalCourses,
            TotalEnrollments = totalEnrollments,
            TotalRevenue = totalRevenue,
            TotalStudents = totalStudents,
            TotalInstructors = totalInstructors,
            TotalAdmins = totalAdmins,
            DraftCourses = draftCourses,
            PendingCourses = pendingCourses,
            PublishedCourses = publishedCourses,
            RejectedCourses = rejectedCourses
        };
    }
}
