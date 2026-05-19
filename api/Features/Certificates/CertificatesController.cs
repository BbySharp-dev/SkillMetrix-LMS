using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Certificates.DTOs;
using SkillMetrix_LMS.API.Shared;

namespace SkillMetrix_LMS.API.Features.Certificates;

[Route("api/certificates")]
[ApiController]
[Authorize]
public class CertificatesController(ICertificateService certificateService) : BaseApiController
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyCertificates()
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetUserCertificatesAsync(userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<List<CertificateDto>>(result.Value!));
    }

    [HttpGet("{certificateId:guid}")]
    public async Task<IActionResult> GetCertificateById(Guid certificateId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetCertificateByIdAsync(userId.Value, certificateId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    [HttpGet("course/{courseId:guid}")]
    public async Task<IActionResult> GetCertificateByCourse(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetCertificateByCourseAsync(userId.Value, courseId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    [HttpPost("course/{courseId:guid}")]
    public async Task<IActionResult> IssueCertificate(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.IssueCertificateAsync(userId.Value, courseId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<CertificateDto>(result.Value!, "Certificate issued successfully"));
    }
}
