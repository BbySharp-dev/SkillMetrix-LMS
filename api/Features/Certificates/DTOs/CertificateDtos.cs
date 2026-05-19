namespace SkillMetrix_LMS.API.Features.Certificates.DTOs;

public class CertificateDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitle { get; set; } = string.Empty;
    public string? CourseThumbnail { get; set; }
    public string? InstructorName { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public string? PdfUrl { get; set; }
    public DateTime IssuedAt { get; set; }
}
