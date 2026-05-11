using System.ComponentModel.DataAnnotations;
using SkillMetrix_LMS.API.Models.Enums;

namespace SkillMetrix_LMS.API.Features.Admin.DTOs;

public class CreateUserDto
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(2)]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
}
