namespace SkillMetrix_LMS.API.Features.Enrollments;

public class EnrollmentEntityConfig : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.Property(e => e.PricePaid)
            .HasColumnType("decimal(18,2)");

        // Prevent duplicate enrollments: one user can only enroll once per course
        builder.HasIndex(e => new { e.UserId, e.CourseId })
            .IsUnique();

        builder.HasIndex(e => e.UserId);
        builder.HasIndex(e => e.CourseId);
        builder.HasIndex(e => e.EnrolledAt);
    }
}