using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Models;

namespace SkillMetrix_LMS.API.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Course> Courses { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<UserLessonProgress> UserLessonProgresses { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

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
