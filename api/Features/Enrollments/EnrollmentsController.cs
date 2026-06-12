using SkillMetrix_LMS.API.Features.Enrollments.DTOs;

namespace SkillMetrix_LMS.API.Features.Enrollments;

/// <summary>
/// Quản lý tiến trình Ghi danh / Đăng ký khóa học (Enrollments).
/// </summary>
/// <remarks>
/// Cung cấp các API để học viên đăng ký khóa học mới, kiểm tra trạng thái đăng ký và xem lại danh sách các khóa học đang theo học (kèm tiến độ).
/// Tất cả các endpoint trong Controller này đều yêu cầu xác thực JWT (người dùng đã đăng nhập).
/// </remarks>
[Route("api/enrollments")]
[ApiController]
public class EnrollmentsController(IEnrollmentService enrollmentService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các khóa học mà học viên hiện tại đã đăng ký.
    /// </summary>
    /// <remarks>
    /// Dùng để hiển thị danh sách khóa học trong không gian học tập (My Learning) của học viên.
    /// Hỗ trợ phân trang, lọc theo tiến độ hoặc trạng thái hoàn thành thông qua các query parameter.
    /// </remarks>
    /// <param name="query">Các tiêu chí phân trang và lọc danh sách đăng ký.</param>
    /// <returns>Danh sách Enrollment (chứa thông tin khóa học và tiến độ) đã được phân trang.</returns>
    /// <response code="200">Lấy danh sách ghi danh thành công.</response>
    /// <response code="401">Missing/Invalid Token (Người dùng chưa đăng nhập).</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<EnrollmentResponseDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyEnrollments([FromQuery] EnrollmentQueryDto query)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await enrollmentService.GetUserEnrollmentsAsync(userId.Value, query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<EnrollmentResponseDto>>>(result.Value!, "Enrollments retrieved successfully."));
    }

    /// <summary>
    /// Ghi danh vào một khóa học mới.
    /// </summary>
    /// <remarks>
    /// **Luồng xử lý:**
    /// - **Khóa học miễn phí (Free):** Trạng thái Enrollment được kích hoạt (`Active`) ngay lập tức, học viên có thể vào học luôn.
    /// - **Khóa học có phí (Paid):** Hệ thống khởi tạo Enrollment với trạng thái chờ (`Pending`) và sinh ra giao dịch (Transaction). Học viên cần hoàn tất thanh toán để kích hoạt.
    /// - **Mã giảm giá:** Có thể truyền thêm `CouponCode` để áp dụng giảm giá trực tiếp vào hóa đơn.
    /// </remarks>
    /// <param name="dto">Thông tin đăng ký bao gồm ID khóa học, phương thức thanh toán và mã giảm giá (nếu có).</param>
    /// <returns>Thông tin Enrollment vừa được tạo (kèm theo URL thanh toán/giao dịch nếu có phát sinh chi phí).</returns>
    /// <response code="200">Khởi tạo ghi danh thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ (Ví dụ: Mã giảm giá sai/hết hạn).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy khóa học cần đăng ký.</response>
    /// <response code="409">Conflict - Người dùng đã đăng ký khóa học này từ trước.</response>
    /// <response code="422">Vi phạm quy tắc nghiệp vụ (Business Rule Violation - VD: Khóa học chưa được mở bán).</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EnrollmentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> Enroll([FromBody] CreateEnrollmentDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await enrollmentService.EnrollAsync(userId.Value, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<EnrollmentResponseDto>(result.Value!, "Enrollment created successfully."));
    }

    /// <summary>
    /// Kiểm tra trạng thái ghi danh của học viên đối với một khóa học cụ thể.
    /// </summary>
    /// <remarks>
    /// Trả về `true` nếu học viên đã đăng ký thành công và có quyền truy cập vào nội dung bài học. Trả về `false` nếu chưa đăng ký hoặc đăng ký chưa hoàn tất thanh toán.
    /// Thường được Frontend gọi trên trang chi tiết khóa học để quyết định hiển thị nút **"Vào học"** hay nút **"Mua ngay"**.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học cần kiểm tra.</param>
    /// <returns>Biến boolean cho biết trạng thái đã ghi danh hay chưa.</returns>
    /// <response code="200">Kiểm tra thành công, trả về true hoặc false.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [Authorize]
    [HttpGet("check/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CheckEnrollment(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await enrollmentService.CheckEnrollmentAsync(userId.Value, courseId);

        return Ok(new ApiResponse<bool>(result.Value, "Check enrollment completed."));
    }
}