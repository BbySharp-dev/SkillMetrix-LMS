using SkillMetrix_LMS.API.Features.Reviews.DTOs;

namespace SkillMetrix_LMS.API.Features.Reviews;

public interface IReviewService
{
    Task<Result<PagedResponse<List<ReviewDto>>>> GetCourseReviewsAsync(Guid courseId, int page, int pageSize);
    Task<Result<CourseReviewStatsDto>> GetCourseReviewStatsAsync(Guid courseId);
    Task<Result<ReviewDto>> CreateReviewAsync(Guid userId, CreateReviewDto dto);
    Task<Result<ReviewDto>> UpdateReviewAsync(Guid userId, Guid reviewId, UpdateReviewDto dto);
    Task<Result> DeleteReviewAsync(Guid userId, Guid reviewId);
    Task<Result<ReviewDto?>> GetUserReviewForCourseAsync(Guid userId, Guid courseId);
}