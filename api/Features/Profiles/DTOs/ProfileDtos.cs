namespace SkillMetrix_LMS.API.Features.Profiles.DTOs;

// ─── Instructor Profile ────────────────────────────────────────────────────────

public class InstructorProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Bio { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Statistics
    public int TotalCourses { get; set; }
    public int PublishedCourses { get; set; }
    public int TotalStudents { get; set; }
    public decimal? AverageRating { get; set; }
    public int TotalLessons { get; set; }
}

public class InstructorCourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Thumbnail { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? Rating { get; set; }
    public int EnrollmentCount { get; set; }
    public int LessonCount { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}

// ─── Student Profile ───────────────────────────────────────────────────────────

public class StudentProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    // Statistics
    public int TotalEnrolledCourses { get; set; }
    public int CompletedCourses { get; set; }
    public int TotalLessonsCompleted { get; set; }
    public decimal TotalSpent { get; set; }
}

public class StudentEnrollmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }
    public decimal PricePaid { get; set; }
    public DateTime EnrolledAt { get; set; }
    public int CompletedLessons { get; set; }
    public int TotalLessons { get; set; }
    public int CompletionPercent { get; set; }
    public string InstructorName { get; set; } = string.Empty;
}