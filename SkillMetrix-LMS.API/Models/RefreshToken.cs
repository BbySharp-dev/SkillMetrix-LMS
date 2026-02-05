namespace SkillMetrix_LMS.API.Models;

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Revoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public User User { get; set; } = null!;
}
