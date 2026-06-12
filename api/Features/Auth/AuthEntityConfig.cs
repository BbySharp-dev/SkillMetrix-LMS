namespace SkillMetrix_LMS.API.Features.Auth;

public class AuthEntityConfig : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.HasIndex(rt => rt.Token)
            .IsUnique();
        builder.HasIndex(rt => rt.UserId);
        builder.HasIndex(rt => rt.ExpiresAt);
        builder.HasIndex(rt => new { rt.UserId, rt.Revoked });
    }
}