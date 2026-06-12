namespace SkillMetrix_LMS.API.Features.Chapters;

public class ChapterEntityConfig : IEntityTypeConfiguration<Chapter>
{
    public void Configure(EntityTypeBuilder<Chapter> builder)
    {
        // Chapter indexes
        builder.HasIndex(ch => ch.CourseId);
        builder.HasIndex(ch => new { ch.CourseId, ch.OrderIndex });
        builder.HasIndex(ch => ch.IsDeleted);
        builder.HasIndex(ch => ch.UpdatedAt);
    }
}