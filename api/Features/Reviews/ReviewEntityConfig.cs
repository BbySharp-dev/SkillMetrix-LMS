namespace SkillMetrix_LMS.API.Features.Reviews;

public class ReviewEntityConfig : IEntityTypeConfiguration<CourseReview>
{
    public void Configure(EntityTypeBuilder<CourseReview> builder)
    {
        builder.Property(r => r.Rating)
            .HasColumnType("smallint");

        builder.HasIndex(r => r.CourseId);
        builder.HasIndex(r => r.UserId);
        builder.HasIndex(r => new { r.CourseId, r.UserId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");
        builder.HasIndex(r => r.CreatedAt);

        builder.HasOne(r => r.Course)
            .WithMany()
            .HasForeignKey(r => r.CourseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}