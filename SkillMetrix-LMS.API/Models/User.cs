using Microsoft.AspNetCore.Identity;
using SkillMetrix_LMS.API.Models.Enums;

namespace SkillMetrix_LMS.API.Models;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
