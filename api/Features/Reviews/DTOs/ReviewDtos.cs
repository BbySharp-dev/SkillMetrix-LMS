namespace SkillMetrix_LMS.API.Features.Reviews.DTOs;

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public string? UserAvatarUrl { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDto
{
    public Guid CourseId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class UpdateReviewDto
{
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

public class CourseReviewStatsDto
{
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public int Rating1Count { get; set; }
    public int Rating2Count { get; set; }
    public int Rating3Count { get; set; }
    public int Rating4Count { get; set; }
    public int Rating5Count { get; set; }
}
