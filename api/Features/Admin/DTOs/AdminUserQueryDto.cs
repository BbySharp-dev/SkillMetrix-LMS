namespace SkillMetrix_LMS.API.Features.Admin.DTOs;

public class AdminUserQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public UserRole? Role { get; set; }
}