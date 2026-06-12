using SkillMetrix_LMS.API.Features.Reviews.DTOs;

namespace SkillMetrix_LMS.API.Features.Reviews;

/// <summary>
/// Quản lý Hệ thống Đánh giá và Nhận xét Khóa học (Course Reviews).
/// </summary>
/// <remarks>
/// Cung cấp các API để Học viên để lại đánh giá (Rating/Review) sau khi trải nghiệm khóa học, 
/// cũng như truy xuất thống kê số sao trung bình hiển thị trên trang chủ và trang chi tiết khóa học.
/// </remarks>
[Route("api/reviews")]
[ApiController]
public class ReviewsController(IReviewService reviewService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách các đánh giá của một khóa học (Hỗ trợ phân trang).
    /// </summary>
    /// <remarks>
    /// API này là Public (AllowAnonymous), bất kỳ ai truy cập vào trang chi tiết khóa học đều có thể đọc được các nhận xét từ học viên đi trước.
    /// Dữ liệu thường được sắp xếp theo thời gian mới nhất hoặc mức độ hữu ích.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học.</param>
    /// <param name="page">Số trang hiện tại (Mặc định: 1).</param>
    /// <param name="pageSize">Số lượng đánh giá trên mỗi trang (Mặc định: 10).</param>
    /// <returns>Danh sách đánh giá đã được phân trang.</returns>
    /// <response code="200">Lấy danh sách đánh giá thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpGet("courses/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<ReviewDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseReviews(Guid courseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await reviewService.GetCourseReviewsAsync(courseId, page, pageSize);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<ReviewDto>>>(result.Value!, "Reviews retrieved successfully."));
    }

    /// <summary>
    /// Lấy thống kê tổng quan về đánh giá của khóa học (Rating Stats).
    /// </summary>
    /// <remarks>
    /// Trả về điểm trung bình (Ví dụ: 4.8 sao) và tổng số lượt đánh giá (Ví dụ: 1,250 lượt).
    /// **Tối ưu UX:** API này rất nhẹ, Frontend nên gọi độc lập để render nhanh thẻ thông tin khóa học (Course Card) thay vì gọi API lấy danh sách toàn bộ review.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Dữ liệu thống kê đánh giá.</returns>
    /// <response code="200">Lấy thống kê thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpGet("courses/{courseId:guid}/stats")]
    [ProducesResponseType(typeof(ApiResponse<CourseReviewStatsDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCourseReviewStats(Guid courseId)
    {
        var result = await reviewService.GetCourseReviewStatsAsync(courseId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<CourseReviewStatsDto>(result.Value!, "Lấy thống kê đánh giá thành công."));
    }

    /// <summary>
    /// Kiểm tra và lấy đánh giá của chính người dùng hiện tại cho một khóa học.
    /// </summary>
    /// <remarks>
    /// Dùng để kiểm tra xem Học viên đã từng đánh giá khóa học này hay chưa. 
    /// - Nếu API trả về Data, Frontend hiển thị Form **"Chỉnh sửa đánh giá"**.
    /// - Nếu API trả về rỗng (null), Frontend hiển thị Form **"Viết đánh giá mới"**.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của khóa học.</param>
    /// <returns>Bài đánh giá của người dùng (nếu có).</returns>
    /// <response code="200">Lấy dữ liệu thành công (Có thể trả về null nếu chưa từng đánh giá).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpGet("courses/{courseId:guid}/my-review")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto?>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetUserReviewForCourse(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new ApiResponse<object>("Vui lòng đăng nhập"));

        var result = await reviewService.GetUserReviewForCourseAsync(userId.Value, courseId);

        return Ok(new ApiResponse<ReviewDto?>(result.Value, "Lấy đánh giá của bạn thành công."));
    }

    /// <summary>
    /// Tạo mới một bài đánh giá cho khóa học.
    /// </summary>
    /// <remarks>
    /// **Ràng buộc nghiệp vụ quan trọng:**
    /// - Học viên **BẮT BUỘC** phải ghi danh (Enroll) khóa học này thì mới có quyền để lại đánh giá.
    /// - Mỗi tài khoản chỉ được phép viết tối đa **01 bài đánh giá** cho mỗi khóa học (Tránh spam rating). Nếu đã đánh giá rồi, vui lòng dùng API Update.
    /// - Mức đánh giá (Rating) hợp lệ từ 1 đến 5 sao.
    /// </remarks>
    /// <param name="dto">Payload chứa số sao đánh giá và nội dung nhận xét.</param>
    /// <returns>Thông tin đánh giá vừa được tạo.</returns>
    /// <response code="200">Tạo bài đánh giá thành công.</response>
    /// <response code="400">Dữ liệu không hợp lệ (Ví dụ: Rating nằm ngoài 1-5).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Forbidden - Học viên chưa đăng ký khóa học này.</response>
    /// <response code="409">Conflict - Người dùng đã đánh giá khóa học này rồi.</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new ApiResponse<object>("Vui lòng đăng nhập"));

        var result = await reviewService.CreateReviewAsync(userId.Value, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<ReviewDto>(result.Value!, "Tạo đánh giá thành công."));
    }

    /// <summary>
    /// Cập nhật nội dung bài đánh giá đã viết trước đó.
    /// </summary>
    /// <remarks>
    /// Học viên có thể thay đổi số sao hoặc nội dung text của bài đánh giá. 
    /// Hệ thống sẽ kiểm tra quyền sở hữu, đảm bảo user chỉ có thể sửa bài đánh giá của chính mình.
    /// </remarks>
    /// <param name="reviewId">Mã định danh (GUID) của Bài đánh giá cần sửa.</param>
    /// <param name="dto">Nội dung đánh giá mới.</param>
    /// <returns>Thông tin bài đánh giá sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật đánh giá thành công.</response>
    /// <response code="400">Dữ liệu cập nhật không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy bài đánh giá, hoặc bài đánh giá này không thuộc về user hiện tại.</response>
    [HttpPut("{reviewId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<ReviewDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateReview(Guid reviewId, [FromBody] UpdateReviewDto dto)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new ApiResponse<object>("Vui lòng đăng nhập"));

        var result = await reviewService.UpdateReviewAsync(userId.Value, reviewId, dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<ReviewDto>(result.Value!, "Cập nhật đánh giá thành công."));
    }

    /// <summary>
    /// Xóa một bài đánh giá.
    /// </summary>
    /// <remarks>
    /// Thu hồi và xóa bỏ bài đánh giá của Học viên khỏi khóa học. 
    /// Sau khi xóa, hệ thống sẽ tự động tính toán lại điểm đánh giá trung bình (Average Rating) của khóa học đó.
    /// </remarks>
    /// <param name="reviewId">Mã định danh (GUID) của Bài đánh giá cần xóa.</param>
    /// <returns>Trạng thái thao tác xóa.</returns>
    /// <response code="200">Xóa đánh giá thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy bài đánh giá, hoặc user không có quyền xóa.</response>
    [HttpDelete("{reviewId:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReview(Guid reviewId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new ApiResponse<object>("Vui lòng đăng nhập"));

        var result = await reviewService.DeleteReviewAsync(userId.Value, reviewId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "Xóa đánh giá thành công."));
    }
}