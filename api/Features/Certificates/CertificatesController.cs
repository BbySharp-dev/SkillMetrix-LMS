using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Certificates.DTOs;
using SkillMetrix_LMS.API.Shared;

namespace SkillMetrix_LMS.API.Features.Certificates;

/// <summary>
/// Quản lý chứng chỉ khóa học: lấy, tạo chứng chỉ.
/// </summary>
[Route("api/certificates")]
[ApiController]
[Authorize]
public class CertificatesController(ICertificateService certificateService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách chứng chỉ của người dùng hiện tại.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(PagedResponse<List<CertificateDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyCertificates([FromQuery] CertificateQueryDto query)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetUserCertificatesAsync(userId.Value, query);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(result.Value);
    }


    /// <summary>
    /// Lấy chi tiết chứng chỉ theo ID.
    /// </summary>
    [HttpGet("{certificateId:guid}")]
    public async Task<IActionResult> GetCertificateById(Guid certificateId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetCertificateByIdAsync(userId.Value, certificateId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    /// <summary>
    /// Lấy chứng chỉ của người dùng cho một khóa học cụ thể.
    /// </summary>
    [HttpGet("course/{courseId:guid}")]
    public async Task<IActionResult> GetCertificateByCourse(Guid courseId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await certificateService.GetCertificateByCourseAsync(userId.Value, courseId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<CertificateDto>(result.Value!));
    }

    /// <summary>
    /// Cấp chứng chỉ cho người dùng hiện tại khi hoàn thành khóa học.
    /// </summary>
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
