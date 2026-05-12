using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Controllers;
using SkillMetrix_LMS.API.Features.Reviews.DTOs;

namespace SkillMetrix_LMS.API.Features.Reviews;

[Route("api/reviews")]
[ApiController]
public class ReviewsController(IReviewService reviewService) : BaseApiController
{
    [HttpGet("courses/{courseId:guid}")]
    public async Task<IActionResult> GetCourseReviews(Guid courseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await reviewService.GetCourseReviewsAsync(courseId, page, pageSize);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<ReviewDto>>(result.Value!, "Lấy danh sách đánh giá thành công."));
    }

    [HttpGet("courses/{courseId:guid}/stats")]
    public async Task<IActionResult> GetCourseReviewStats(Guid courseId)
    {
        var result = await reviewService.GetCourseReviewStatsAsync(courseId);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<CourseReviewStatsDto>(result.Value!, "Lấy thống kê đánh giá thành công."));
    }

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
