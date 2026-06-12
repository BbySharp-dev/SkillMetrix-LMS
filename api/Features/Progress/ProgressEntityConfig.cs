namespace SkillMetrix_LMS.API.Features.Progress;

public class ProgressEntityConfig : IEntityTypeConfiguration<UserLessonProgress>
{
    public void Configure(EntityTypeBuilder<UserLessonProgress> builder)
    {
        // Composite key: track progress per user per lesson
        builder.HasKey(ulp => new { ulp.UserId, ulp.LessonId });

        builder.HasIndex(ulp => ulp.UserId);
        builder.HasIndex(ulp => ulp.LessonId);
        builder.HasIndex(ulp => ulp.LastUpdatedAt);
        builder.HasIndex(ulp => ulp.CompletedAt);
        // Index for streak calculation queries
        builder.HasIndex(ulp => new { ulp.UserId, ulp.LastUpdatedAt });
        builder.HasIndex(ulp => new { ulp.UserId, ulp.IsCompleted });
    }
}