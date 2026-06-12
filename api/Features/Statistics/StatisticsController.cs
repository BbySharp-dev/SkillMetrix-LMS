using SkillMetrix_LMS.API.Features.Admin.DTOs;
using SkillMetrix_LMS.API.Features.Statistics.DTOs;

namespace SkillMetrix_LMS.API.Features.Statistics;

/// <summary>
/// Quản lý dữ liệu Thống kê và Báo cáo (Analytics and Statistics).
/// </summary>
/// <remarks>
/// Cung cấp các API phục vụ cho trang Dashboard của Giảng viên (Instructor) và Quản trị viên (Admin/Moderator).
/// Dữ liệu trả về được tối ưu để Frontend có thể dễ dàng map vào các thư viện vẽ biểu đồ (Chart.js, Recharts, ApexCharts...).
/// </remarks>
[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "RequireInstructorOrAdmin")]
public class StatisticsController(IStatisticsService statisticsService) : BaseApiController
{
    /// <summary>
    /// Lấy các chỉ số tổng quan (KPIs) của Giảng viên hiện tại.
    /// </summary>
    /// <remarks>
    /// Trả về các con số thống kê tổng quát như: Tổng số khóa học đang bán, Tổng số học viên đã ghi danh, và Tổng doanh thu đạt được.
    /// Dùng để hiển thị các thẻ Summary Cards trên cùng của trang Dashboard Giảng viên.
    /// </remarks>
    /// <returns>Dữ liệu tổng quan KPI của Giảng viên.</returns>
    /// <response code="200">Lấy dữ liệu tổng quan thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không có quyền Instructor).</response>
    [HttpGet("instructor/overview")]
    [ProducesResponseType(typeof(ApiResponse<InstructorOverviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
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
    /// Lấy dữ liệu biến động Doanh thu theo thời gian của Giảng viên.
    /// </summary>
    /// <remarks>
    /// Trả về mảng dữ liệu điểm (Data Points) theo từng tháng. 
    /// Rất phù hợp để Frontend render biểu đồ đường (Line Chart) hoặc biểu đồ cột (Bar Chart) thể hiện xu hướng doanh thu.
    /// </remarks>
    /// <param name="months">Số tháng quay lui muốn lấy thống kê (Mặc định: 12 tháng gần nhất).</param>
    /// <returns>Danh sách các điểm dữ liệu doanh thu theo tháng.</returns>
    /// <response code="200">Lấy dữ liệu doanh thu thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpGet("instructor/revenue")]
    [ProducesResponseType(typeof(ApiResponse<List<RevenuePointDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
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
    /// Lấy danh sách các hoạt động mới nhất liên quan đến khóa học của Giảng viên.
    /// </summary>
    /// <remarks>
    /// Đóng vai trò như một bảng tin (Activity Feed) hiển thị các sự kiện như: Học viên A vừa mua khóa học, Học viên B vừa hoàn thành bài học, Học viên C vừa để lại đánh giá...
    /// </remarks>
    /// <param name="limit">Số lượng hoạt động tối đa muốn lấy (Mặc định: 10 hoạt động gần nhất).</param>
    /// <returns>Danh sách các sự kiện hoạt động.</returns>
    /// <response code="200">Lấy danh sách hoạt động thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpGet("instructor/activity")]
    [ProducesResponseType(typeof(ApiResponse<List<RecentActivityDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
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
    /// Báo cáo chi tiết hiệu suất của từng khóa học (Dành cho Admin đánh giá).
    /// </summary>
    /// <remarks>
    /// **Phân quyền:** Chỉ Quản trị viên (Admin) mới có quyền truy cập API này để kiểm tra chéo hiệu suất của Giảng viên.
    /// Cung cấp các insight chuyên sâu như Tỷ lệ hoàn thành khóa học (Completion Rate), Tỷ lệ bỏ cuộc (Drop-off Rate), Số lượng ghi danh...
    /// </remarks>
    /// <param name="courseId">Mã định danh của khóa học cụ thể (Nếu để null sẽ trả về hiệu suất của tất cả khóa học).</param>
    /// <returns>Danh sách báo cáo hiệu suất các khóa học.</returns>
    /// <response code="200">Lấy báo cáo hiệu suất thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Yêu cầu quyền Admin).</response>
    [Authorize(Policy = "RequireAdmin")]
    [HttpGet("instructor/performance")]
    [ProducesResponseType(typeof(ApiResponse<List<CoursePerformanceDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
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
    /// Lấy báo cáo thống kê tổng quan toàn bộ Hệ thống (Dành cho Admin/Moderator).
    /// </summary>
    /// <remarks>
    /// **Phân quyền:** Dành riêng cho Super Admin hoặc Moderator để theo dõi "sức khỏe" của toàn hệ thống LMS.
    /// Bao gồm: Tổng doanh thu sàn, Tổng số user hiện có, Số lượng khóa học chờ duyệt, Tốc độ tăng trưởng...
    /// </remarks>
    /// <returns>Dữ liệu tổng quan hệ thống.</returns>
    /// <response code="200">Lấy dữ liệu hệ thống thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Admin/Moderator mới có quyền).</response>
    [Authorize(Policy = "RequireAdminOrModerator")]
    [HttpGet("admin/overview")]
    [ProducesResponseType(typeof(ApiResponse<AdminOverviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAdminOverview()
    {
        var result = await statisticsService.GetAdminOverviewAsync();
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<AdminOverviewDto>(result.Value!, "Admin overview retrieved"));
    }
}