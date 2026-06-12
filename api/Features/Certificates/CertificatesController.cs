using SkillMetrix_LMS.API.Features.Certificates.DTOs;

namespace SkillMetrix_LMS.API.Features.Certificates;

/// <summary>
/// Quản lý chứng chỉ khóa học (Certificates).
/// Cung cấp các API để học viên xem danh sách chứng chỉ đã đạt được và hệ thống cấp phát chứng chỉ mới khi hoàn thành khóa học.
/// </summary>
[Route("api/certificates")]
[ApiController]
[Authorize]
public class CertificatesController(ICertificateService certificateService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách chứng chỉ của người dùng hiện tại (Hỗ trợ phân trang).
    /// </summary>
    /// <remarks>
    /// Trả về danh sách tất cả các chứng chỉ mà học viên đang đăng nhập đã đạt được.
    /// Có thể kết hợp lọc, tìm kiếm và phân trang thông qua query parameters.
    /// </remarks>
    /// <param name="query">Các tiêu chí phân trang và lọc chứng chỉ.</param>
    /// <returns>Danh sách chứng chỉ đã được phân trang.</returns>
    /// <response code="200">Lấy danh sách chứng chỉ thành công.</response>
    /// <response code="401">Người dùng chưa xác thực (Missing/Invalid Token).</response>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<CertificateDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyCertificates([FromQuery] CertificateQueryDto query)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await certificateService.GetUserCertificatesAsync(userId.Value, query);
        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<CertificateDto>>>(result.Value!, "Certificates retrieved successfully"));
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một chứng chỉ theo ID.
    /// </summary>
    /// <remarks>
    /// API này dùng để xem chi tiết một chứng chỉ cụ thể (ví dụ: ngày cấp, mã chứng chỉ, URL hình ảnh chứng chỉ).
    /// **Lưu ý:** Chỉ trả về dữ liệu nếu chứng chỉ đó thực sự thuộc sở hữu của người dùng đang đăng nhập.
    /// </remarks>
    /// <param name="certificateId">Mã định danh (GUID) của chứng chỉ cần lấy.</param>
    /// <returns>Thông tin chi tiết của chứng chỉ.</returns>
    /// <response code="200">Lấy thông tin chứng chỉ thành công.</response>
    /// <response code="401">Người dùng chưa xác thực.</response>
    /// <response code="404">Không tìm thấy chứng chỉ hoặc chứng chỉ không thuộc về người dùng này.</response>
    [HttpGet("{certificateId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCertificateById(Guid certificateId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await certificateService.GetCertificateByIdAsync(userId.Value, certificateId);
        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    /// <summary>
    /// Lấy chứng chỉ của người dùng dựa trên ID khóa học.
    /// </summary>
    /// <remarks>
    /// Kiểm tra và lấy thông tin chứng chỉ mà người dùng đã đạt được cho một khóa học cụ thể.
    /// Thường được Frontend sử dụng ở trang chi tiết khóa học để hiển thị trạng thái "Đã nhận chứng chỉ".
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Thông tin chứng chỉ của khóa học đó.</returns>
    /// <response code="200">Tìm thấy và trả về thông tin chứng chỉ.</response>
    /// <response code="401">Người dùng chưa xác thực.</response>
    /// <response code="404">Người dùng chưa được cấp chứng chỉ cho khóa học này (hoặc khóa học không tồn tại).</response>
    [HttpGet("course/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCertificateByCourse(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await certificateService.GetCertificateByCourseAsync(userId.Value, courseId);
        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    /// <summary>
    /// Cấp mới chứng chỉ cho người dùng hiện tại khi hoàn thành khóa học.
    /// </summary>
    /// <remarks>
    /// Hệ thống sẽ kiểm tra xem người dùng đã thực sự hoàn thành đủ 100% tiến độ/điều kiện của khóa học hay chưa trước khi cấp chứng chỉ.
    /// Nếu người dùng đã được cấp chứng chỉ cho khóa học này từ trước, hệ thống sẽ trả về lỗi tương ứng.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học vừa hoàn thành.</param>
    /// <returns>Thông tin chứng chỉ vừa được cấp phát.</returns>
    /// <response code="200">Cấp chứng chỉ thành công.</response>
    /// <response code="400">Người dùng chưa đủ điều kiện hoàn thành khóa học hoặc đã được cấp chứng chỉ trước đó.</response>
    /// <response code="401">Người dùng chưa xác thực.</response>
    /// <response code="404">Không tìm thấy dữ liệu khóa học.</response>
    [HttpPost("course/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<CertificateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> IssueCertificate(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await certificateService.IssueCertificateAsync(userId.Value, courseId);
        if (!result.IsSuccess) return HandleError(result);

        return Ok(new ApiResponse<CertificateDto>(result.Value!, "Certificate issued successfully"));
    }
}