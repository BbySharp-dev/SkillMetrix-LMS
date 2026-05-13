using SkillMetrix_LMS.API.Features.Admin.DTOs;
using SkillMetrix_LMS.API.Features.Statistics.DTOs;

namespace SkillMetrix_LMS.API.Features.Statistics;

public interface IStatisticsService
{
    Task<Result<InstructorOverviewDto>> GetInstructorOverviewAsync(Guid instructorId);
    Task<Result<List<RevenuePointDto>>> GetInstructorRevenueAsync(Guid instructorId, int months = 12);
    Task<Result<List<RecentActivityDto>>> GetRecentActivityAsync(Guid instructorId, int limit = 10);
    Task<Result<List<CoursePerformanceDto>>> GetCoursePerformanceAsync(Guid instructorId, Guid? courseId = null);
    Task<Result<AdminOverviewDto>> GetAdminOverviewAsync();
}
