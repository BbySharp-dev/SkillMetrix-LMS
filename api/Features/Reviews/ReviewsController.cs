using SkillMetrix_LMS.API.Features.Reviews.DTOs;

namespace SkillMetrix_LMS.API.Features.Reviews;

/// <summary>
/// Quản lý đánh giá khóa học: xem, tạo, cập nhật, xóa review.
/// </summary>
[Route("api/reviews")]
[ApiController]
public class ReviewsController(IReviewService reviewService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách đánh giá của một khóa học (có phân trang).
    /// </summary>
    [HttpGet("courses/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<ReviewDto>>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCourseReviews(Guid courseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await reviewService.GetCourseReviewsAsync(courseId, page, pageSize);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<ReviewDto>>>(result.Value!, "Reviews retrieved successfully."));
    }


    /// <summary>
    /// Lấy thống kê đánh giá của một khóa học (trung bình sao, tổng số review).
    /// </summary>
    [HttpGet("courses/{courseId:guid}/stats")]
    public async Task<IActionResult> GetCourseReviewStats(Guid courseId)
    {
        var result = await reviewService.GetCourseReviewStatsAsync(courseId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<CourseReviewStatsDto>(result.Value!, "Lấy thống kê đánh giá thành công."));
    }

    /// <summary>
    /// Lấy đánh giá của người dùng hiện tại cho một khóa học.
    /// </summary>
    [HttpGet("courses/{courseId:guid}/my-review")]
    [Authorize]
    public async Task<IActionResult> GetUserReviewForCourse(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new ApiResponse<object>("Vui lòng đăng nhập"));

        var result = await reviewService.GetUserReviewForCourseAsync(userId.Value, courseId);

        return Ok(new ApiResponse<ReviewDto?>(result.Value, "Lấy đánh giá của bạn thành công."));
    }

    /// <summary>
    /// Tạo đánh giá cho một khóa học (Student đã ghi danh).
    /// </summary>
    [HttpPost]
    [Authorize]
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
    /// Cập nhật đánh giá của người dùng hiện tại.
    /// </summary>
    [HttpPut("{reviewId:guid}")]
    [Authorize]
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
    /// Xóa đánh giá của người dùng hiện tại.
    /// </summary>
    [HttpDelete("{reviewId:guid}")]
    [Authorize]
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
