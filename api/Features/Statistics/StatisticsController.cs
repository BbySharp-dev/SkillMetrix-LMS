using SkillMetrix_LMS.API.Features.Admin.DTOs;
using SkillMetrix_LMS.API.Features.Statistics.DTOs;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Features.Statistics;

/// <summary>
/// Thống kê: doanh thu, hiệu suất khóa học, hoạt động gần đây.
/// </summary>
[Route("api/[controller]")]
[Authorize(Policy = "RequireInstructorOrAdmin")]
public class StatisticsController(IStatisticsService statisticsService) : BaseApiController
{
    /// <summary>
    /// Lấy tổng quan thống kê của Instructor (tổng số khóa học, học viên, doanh thu).
    /// </summary>
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

    /// <summary>
    /// Lấy dữ liệu doanh thu theo tháng của Instructor.
    /// </summary>
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

    /// <summary>
    /// Lấy danh sách hoạt động gần đây của Instructor (ghi danh, tiến độ học viên).
    /// </summary>
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

    /// <summary>
    /// Lấy hiệu suất khóa học (số lượng học viên, tỷ lệ hoàn thành) — Admin.
    /// </summary>
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

    /// <summary>
    /// Lấy tổng quan thống kê toàn hệ thống — Admin/Moderator.
    /// </summary>
    [Authorize(Policy = "RequireAdminOrModerator")]
    [HttpGet("admin/overview")]
    public async Task<IActionResult> GetAdminOverview()
    {
        var result = await statisticsService.GetAdminOverviewAsync();
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<AdminOverviewDto>(result.Value!, "Admin overview retrieved"));
    }
}
