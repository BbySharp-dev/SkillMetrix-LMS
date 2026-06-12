namespace SkillMetrix_LMS.API.Features.Certificates;

public class CertificateEntityConfig : IEntityTypeConfiguration<Certificate>
{
    public void Configure(EntityTypeBuilder<Certificate> builder)
    {
        builder.HasIndex(c => c.CertificateCode)
            .IsUnique();
        builder.HasIndex(c => new { c.UserId, c.CourseId })
            .IsUnique();

        builder.HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.Course)
            .WithMany()
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}