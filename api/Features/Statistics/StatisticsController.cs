using SkillMetrix_LMS.API.Features.Admin.DTOs;
using SkillMetrix_LMS.API.Features.Statistics.DTOs;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Features.Statistics;

[Route("api/[controller]")]
[Authorize(Policy = "RequireInstructorOrAdmin")]
public class StatisticsController(IStatisticsService statisticsService) : BaseApiController
{
    [HttpGet("instructor/overview")]
    public async Task<IActionResult> GetInstructorOverview()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await statisticsService.GetInstructorOverviewAsync(actorId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<InstructorOverviewDto>(result.Value!, "Instructor overview retrieved"));
    }

    [HttpGet("instructor/revenue")]
    public async Task<IActionResult> GetInstructorRevenue([FromQuery] int months = 12)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await statisticsService.GetInstructorRevenueAsync(actorId, months);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<RevenuePointDto>>(result.Value!, "Instructor revenue retrieved"));
    }

    [HttpGet("instructor/activity")]
    public async Task<IActionResult> GetRecentActivity([FromQuery] int limit = 10)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await statisticsService.GetRecentActivityAsync(actorId, limit);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<RecentActivityDto>>(result.Value!, "Recent activity retrieved"));
    }

    [Authorize(Policy = "RequireAdmin")]
    [HttpGet("instructor/performance")]
    public async Task<IActionResult> GetCoursePerformance([FromQuery] Guid? courseId = null)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
            return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await statisticsService.GetCoursePerformanceAsync(actorId, courseId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<CoursePerformanceDto>>(result.Value!, "Course performance retrieved"));
    }

    [Authorize(Policy = "RequireAdmin")]
    [HttpGet("admin/overview")]
    public async Task<IActionResult> GetAdminOverview()
    {
        var result = await statisticsService.GetAdminOverviewAsync();
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<AdminOverviewDto>(result.Value!, "Admin overview retrieved"));
    }
}
