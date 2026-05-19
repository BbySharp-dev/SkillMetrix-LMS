namespace SkillMetrix_LMS.API.Features.Certificates.DTOs;

public class CertificateQueryDto
{
    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
