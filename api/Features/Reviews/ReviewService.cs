using SkillMetrix_LMS.API.Features.Reviews.DTOs;

namespace SkillMetrix_LMS.API.Features.Reviews;

public class ReviewService(ApplicationDbContext context) : IReviewService
{
    public async Task<Result<PagedResponse<List<ReviewDto>>>> GetCourseReviewsAsync(Guid courseId, int page, int pageSize)
    {
        var baseQuery = context.CourseReviews
            .AsNoTracking()
            .Include(r => r.User)
            .Where(r => r.CourseId == courseId && !r.IsDeleted)
            .OrderByDescending(r => r.CreatedAt);

        var totalCount = await baseQuery.CountAsync();

        var reviews = await baseQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                CourseId = r.CourseId,
                UserId = r.UserId,
                UserFullName = r.User.FullName,
                UserAvatarUrl = r.User.AvatarUrl,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return new PagedResponse<List<ReviewDto>>(reviews, page, pageSize, totalCount);
    }


    public async Task<Result<CourseReviewStatsDto>> GetCourseReviewStatsAsync(Guid courseId)
    {
        var reviews = await context.CourseReviews
            .AsNoTracking()
            .Where(r => r.CourseId == courseId && !r.IsDeleted)
            .ToListAsync();

        var stats = new CourseReviewStatsDto
        {
            TotalReviews = reviews.Count,
            AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0,
            Rating1Count = reviews.Count(r => r.Rating == 1),
            Rating2Count = reviews.Count(r => r.Rating == 2),
            Rating3Count = reviews.Count(r => r.Rating == 3),
            Rating4Count = reviews.Count(r => r.Rating == 4),
            Rating5Count = reviews.Count(r => r.Rating == 5)
        };

        return stats;
    }

    public async Task<Result<ReviewDto>> CreateReviewAsync(Guid userId, CreateReviewDto dto)
    {
        var isEnrolled = await context.Enrollments.AnyAsync(e => e.UserId == userId && e.CourseId == dto.CourseId);

        if (!isEnrolled)
            return Result<ReviewDto>.Forbidden("Bạn cần đăng ký khóa học trước khi đánh giá.");

        var existingReview = await context.CourseReviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == dto.CourseId && !r.IsDeleted);

        if (existingReview != null)
            return Result<ReviewDto>.Failure("Bạn đã đánh giá khóa học này rồi.");

        if (dto.Rating < 1 || dto.Rating > 5)
            return Result<ReviewDto>.Failure("Rating phải từ 1 đến 5.");

        var review = new CourseReview
        {
            Id = Guid.NewGuid(),
            CourseId = dto.CourseId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        context.CourseReviews.Add(review);
        await context.SaveChangesAsync();

        var user = await context.Users.FindAsync(userId);

        return new ReviewDto
        {
            Id = review.Id,
            CourseId = review.CourseId,
            UserId = review.UserId,
            UserFullName = user?.FullName ?? "Unknown",
            UserAvatarUrl = user?.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<Result<ReviewDto>> UpdateReviewAsync(Guid userId, Guid reviewId, UpdateReviewDto dto)
    {
        var review = await context.CourseReviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId && !r.IsDeleted);

        if (review == null)
            return Result<ReviewDto>.NotFound("Review không tìm thấy.");

        if (dto.Rating < 1 || dto.Rating > 5)
            return Result<ReviewDto>.Failure("Rating phải từ 1 đến 5.");

        review.Rating = dto.Rating;
        review.Comment = dto.Comment;
        review.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        var user = await context.Users.FindAsync(userId);

        return new ReviewDto
        {
            Id = review.Id,
            CourseId = review.CourseId,
            UserId = review.UserId,
            UserFullName = user?.FullName ?? "Unknown",
            UserAvatarUrl = user?.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<Result> DeleteReviewAsync(Guid userId, Guid reviewId)
    {
        var review = await context.CourseReviews
            .FirstOrDefaultAsync(r => r.Id == reviewId && r.UserId == userId);

        if (review == null)
            return Result.NotFound("Review không tìm thấy hoặc bạn không có quyền xóa.");

        review.IsDeleted = true;
        await context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<ReviewDto?>> GetUserReviewForCourseAsync(Guid userId, Guid courseId)
    {
        var review = await context.CourseReviews
            .AsNoTracking()
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.UserId == userId && r.CourseId == courseId && !r.IsDeleted);

        if (review == null)
            return (ReviewDto?)null;

        return new ReviewDto
        {
            Id = review.Id,
            CourseId = review.CourseId,
            UserId = review.UserId,
            UserFullName = review.User.FullName,
            UserAvatarUrl = review.User.AvatarUrl,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
