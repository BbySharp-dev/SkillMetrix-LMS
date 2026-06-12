namespace SkillMetrix_LMS.API.Features.Courses;

public class CourseEntityConfig : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.Property(c => c.Status)
            .HasColumnType("smallint");

        builder.HasIndex(c => c.InstructorId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.CreatedAt);
        builder.HasIndex(c => c.UpdatedAt);
        builder.HasIndex(c => c.PublishedAt);
        builder.HasIndex(c => c.IsDeleted);
        builder.HasIndex(c => c.Rating);
        builder.HasIndex(c => new { c.Status, c.IsDeleted, c.PublishedAt });

        // Restrict delete to prevent orphaned courses if instructor is deleted
        builder.HasOne(c => c.Instructor)
            .WithMany()
            .HasForeignKey(c => c.InstructorId)
            .OnDelete(DeleteBehavior.Restrict);

        // Cascade delete: deleting course removes all chapters
        builder.HasMany(c => c.Chapters)
            .WithOne(ch => ch.Course)
            .HasForeignKey(ch => ch.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restrict delete to preserve enrollment history
        builder.HasMany(c => c.Enrollments)
            .WithOne(e => e.Course)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}