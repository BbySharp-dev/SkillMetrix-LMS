namespace SkillMetrix_LMS.API.Features.Auth.DTOs;

public class ResendVerificationDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address")]
    public string Email { get; set; } = string.Empty;
}