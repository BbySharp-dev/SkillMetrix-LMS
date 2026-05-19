using SkillMetrix_LMS.API.Features.Certificates.DTOs;

namespace SkillMetrix_LMS.API.Features.Certificates;

public interface ICertificateService
{
    Task<Result<List<CertificateDto>>> GetUserCertificatesAsync(Guid userId);
    Task<Result<CertificateDto>> GetCertificateByIdAsync(Guid userId, Guid certificateId);
    Task<Result<CertificateDto>> GetCertificateByCourseAsync(Guid userId, Guid courseId);
    Task<Result<CertificateDto>> IssueCertificateAsync(Guid userId, Guid courseId);
}
