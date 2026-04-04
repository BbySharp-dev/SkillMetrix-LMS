using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Models;

namespace SkillMetrix_LMS.API.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<User, IdentityRole<Guid>, Guid>(options)
{

    public DbSet<Course> Courses { get; set; } = null!;
    public DbSet<Chapter> Chapters { get; set; } = null!;
    public DbSet<Lesson> Lessons { get; set; } = null!;
    public DbSet<Enrollment> Enrollments { get; set; } = null!;
    public DbSet<UserLessonProgress> UserLessonProgresses { get; set; } = null!;
    public DbSet<Transaction> Transactions { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<CourseReview> CourseReviews { get; set; } = null!;
    public DbSet<Quiz> Quizzes { get; set; } = null!;
    public DbSet<QuizQuestion> QuizQuestions { get; set; } = null!;
    public DbSet<QuizOption> QuizOptions { get; set; } = null!;
    public DbSet<QuizAttempt> QuizAttempts { get; set; } = null!;
    public DbSet<QuizAttemptAnswer> QuizAttemptAnswers { get; set; } = null!;
    public DbSet<Certificate> Certificates { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Course>()
            .HasIndex(c => c.InstructorId);
        builder.Entity<Course>()
            .HasIndex(c => c.Status);
        builder.Entity<Course>()
            .HasIndex(c => c.CreatedAt);
        builder.Entity<Course>()
            .HasIndex(c => c.UpdatedAt);
        builder.Entity<Course>()
            .HasIndex(c => c.PublishedAt);
        builder.Entity<Course>()
            .HasIndex(c => c.IsDeleted);
        builder.Entity<Course>()
            .HasIndex(c => c.Rating);
        builder.Entity<Course>()
            .HasIndex(c => new { c.Status, c.IsDeleted, c.PublishedAt });

        // Restrict delete to prevent orphaned courses if instructor is deleted
        builder.Entity<Course>()
            .HasOne(c => c.Instructor)
            .WithMany()
            .HasForeignKey(c => c.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cascade delete: deleting course removes all chapters
        builder.Entity<Course>()
            .HasMany(c => c.Chapters)
            .WithOne(ch => ch.Course)
            .HasForeignKey(ch => ch.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict delete to preserve enrollment history
        builder.Entity<Course>()
            .HasMany(c => c.Enrollments)
            .WithOne(e => e.Course)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Chapter indexes
        builder.Entity<Chapter>()
            .HasIndex(ch => ch.CourseId);
        builder.Entity<Chapter>()
            .HasIndex(ch => new { ch.CourseId, ch.OrderIndex });
        builder.Entity<Chapter>()
            .HasIndex(ch => ch.IsDeleted);
        builder.Entity<Chapter>()
            .HasIndex(ch => ch.UpdatedAt);

        // Lesson indexes
        builder.Entity<Lesson>()
            .HasIndex(l => l.ChapterId);
        builder.Entity<Lesson>()
            .HasIndex(l => new { l.ChapterId, l.OrderIndex });
        builder.Entity<Lesson>()
            .HasIndex(l => l.IsDeleted);
        builder.Entity<Lesson>()
            .HasIndex(l => l.UpdatedAt);
        builder.Entity<Lesson>()
            .HasIndex(l => l.IsFreePreview);

        builder.Entity<Enrollment>()
            .Property(e => e.PricePaid)
            .HasColumnType("decimal(18,2)");

        // Prevent duplicate enrollments: one user can only enroll once per course
        builder.Entity<Enrollment>()
            .HasIndex(e => new { e.UserId, e.CourseId })
            .IsUnique();

        builder.Entity<Enrollment>()
            .HasIndex(e => e.UserId);
        builder.Entity<Enrollment>()
            .HasIndex(e => e.CourseId);
        builder.Entity<Enrollment>()
            .HasIndex(e => e.EnrolledAt);

        // Composite key: track progress per user per lesson
        builder.Entity<UserLessonProgress>()
            .HasKey(ulp => new { ulp.UserId, ulp.LessonId });

        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => ulp.UserId);
        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => ulp.LessonId);
        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => ulp.LastUpdatedAt);
        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => ulp.CompletedAt);
        // Index for streak calculation queries
        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => new { ulp.UserId, ulp.LastUpdatedAt });
        builder.Entity<UserLessonProgress>()
            .HasIndex(ulp => new { ulp.UserId, ulp.IsCompleted });

        builder.Entity<Transaction>()
            .Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Transaction>()
            .HasIndex(t => t.UserId);
        builder.Entity<Transaction>()
            .HasIndex(t => t.Type);
        builder.Entity<Transaction>()
            .HasIndex(t => t.Status);
        builder.Entity<Transaction>()
            .HasIndex(t => t.CreatedAt);
        builder.Entity<Transaction>()
            .HasIndex(t => t.EnrollmentId);
        builder.Entity<Transaction>()
            .HasIndex(t => t.CourseId);
        builder.Entity<Transaction>()
            .HasIndex(t => new { t.UserId, t.CreatedAt });
        builder.Entity<Transaction>()
            .HasIndex(t => new { t.UserId, t.Type, t.Status });

        // Transaction relationships
        // Use Restrict instead of SetNull to avoid multiple cascade paths error in SQL Server
        builder.Entity<Transaction>()
            .HasOne(t => t.Enrollment)
            .WithMany()
            .HasForeignKey(t => t.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Transaction>()
            .HasOne(t => t.Course)
            .WithMany()
            .HasForeignKey(t => t.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        // CourseReview
        builder.Entity<CourseReview>()
            .HasIndex(r => r.CourseId);
        builder.Entity<CourseReview>()
            .HasIndex(r => r.UserId);
        builder.Entity<CourseReview>()
            .HasIndex(r => new { r.CourseId, r.UserId })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
        builder.Entity<CourseReview>()
            .HasIndex(r => r.CreatedAt);

        builder.Entity<CourseReview>()
            .HasOne(r => r.Course)
            .WithMany()
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<CourseReview>()
            .HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Quiz
        builder.Entity<Quiz>()
            .Property(q => q.PassingScore)
            .HasColumnType("decimal(5,2)");

        builder.Entity<Quiz>()
            .HasIndex(q => q.CourseId);

        builder.Entity<QuizQuestion>()
            .Property(q => q.Point)
            .HasColumnType("decimal(5,2)");

        builder.Entity<QuizQuestion>()
            .HasIndex(q => new { q.QuizId, q.OrderIndex });

        builder.Entity<QuizOption>()
            .HasIndex(o => new { o.QuestionId, o.OrderIndex });

        builder.Entity<QuizAttempt>()
            .Property(a => a.Score)
            .HasColumnType("decimal(5,2)");

        builder.Entity<QuizAttempt>()
            .HasIndex(a => a.QuizId);
        builder.Entity<QuizAttempt>()
            .HasIndex(a => a.UserId);
        builder.Entity<QuizAttempt>()
            .HasIndex(a => a.StartedAt);

        builder.Entity<QuizAttemptAnswer>()
            .HasIndex(a => a.AttemptId);
        builder.Entity<QuizAttemptAnswer>()
            .HasIndex(a => a.QuestionId);
        builder.Entity<QuizAttemptAnswer>()
            .HasIndex(a => new { a.AttemptId, a.QuestionId })
            .IsUnique();

        // Composite FK: ensure SelectedOption belongs to Question
        builder.Entity<QuizOption>()
            .HasAlternateKey(o => new { o.Id, o.QuestionId });

        builder.Entity<QuizAttemptAnswer>()
            .HasOne(a => a.SelectedOption)
            .WithMany()
            .HasForeignKey(a => new { a.SelectedOptionId, a.QuestionId })
            .HasPrincipalKey(o => new { o.Id, o.QuestionId })
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<QuizAttemptAnswer>()
            .HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);

        // Certificate
        builder.Entity<Certificate>()
            .HasIndex(c => c.CertificateCode)
            .IsUnique();
        builder.Entity<Certificate>()
            .HasIndex(c => new { c.UserId, c.CourseId })
            .IsUnique();

        builder.Entity<Certificate>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Certificate>()
            .HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .IsUnique();
        builder.Entity<RefreshToken>()
            .HasIndex(rt => rt.UserId);
        builder.Entity<RefreshToken>()
            .HasIndex(rt => rt.ExpiresAt);
        builder.Entity<RefreshToken>()
            .HasIndex(rt => new { rt.UserId, rt.Revoked });
    }
}
