namespace SkillMetrix_LMS.API.Features.Certificates.Entities;

public class Certificate
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid CourseId { get; set; }
    [MaxLength(100)]
    public string CertificateCode { get; set; } = string.Empty;

    [MaxLength(500)]
    public string PdfUrl { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Course Course { get; set; } = null!;
}