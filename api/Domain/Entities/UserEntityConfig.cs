namespace SkillMetrix_LMS.API.Domain.Entities;

public class UserEntityConfig : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.Role)
            .HasColumnType("smallint");

        builder.Property(u => u.PasswordHash)
            .HasMaxLength(255);
    }
}