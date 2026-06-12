using Microsoft.AspNetCore.Identity;

namespace SkillMetrix_LMS.API.Domain.Entities;

public class User : IdentityUser<Guid>
{
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [Column(TypeName = "smallint")]
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}