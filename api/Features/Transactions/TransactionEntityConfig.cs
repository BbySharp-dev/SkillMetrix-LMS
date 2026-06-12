namespace SkillMetrix_LMS.API.Features.Transactions;

public class TransactionEntityConfig : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.Property(t => t.Type)
            .HasColumnType("smallint");

        builder.Property(t => t.Status)
            .HasColumnType("smallint");

        builder.Property(t => t.Amount)
            .HasColumnType("decimal(18,2)");

        builder.HasIndex(t => t.UserId);
        builder.HasIndex(t => t.Type);
        builder.HasIndex(t => t.Status);
        builder.HasIndex(t => t.CreatedAt);
        builder.HasIndex(t => t.EnrollmentId);
        builder.HasIndex(t => t.CourseId);
        builder.HasIndex(t => new { t.UserId, t.CreatedAt });
        builder.HasIndex(t => new { t.UserId, t.Type, t.Status });

        // Transaction relationships
        builder.HasOne(t => t.Enrollment)
            .WithMany()
            .HasForeignKey(t => t.EnrollmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.Course)
            .WithMany()
            .HasForeignKey(t => t.CourseId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}