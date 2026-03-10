using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace SkillMetrix_LMS.API.Features.Upload;

/// <summary>
/// Upload tài nguyên media dùng chung của hệ thống.
/// </summary>
/// <remarks>
/// Hiện tại controller này chỉ hỗ trợ upload image (thumbnail, avatar, banner...).
/// Upload video bài học được xử lý riêng trong LessonsController theo chuẩn 1-step upload.
/// </remarks>
[Route("api/[controller]")]
public class UploadController(IFileUploadService uploadService) : BaseApiController
{
    private readonly IFileUploadService _uploadService = uploadService;

    /// <summary>
    /// Upload ảnh lên cloud storage.
    /// </summary>
    /// <param name="file">File ảnh dạng multipart/form-data.</param>
    /// <returns>URL ảnh đã upload thành công.</returns>
    /// <response code="200">Upload ảnh thành công.</response>
    /// <response code="400">Không có file hoặc định dạng file không hợp lệ.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost("image")]
    [RequestSizeLimit(10_000_000)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiResponse<string>("No file uploaded."));
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            return BadRequest(new ApiResponse<string>(
                $"Invalid file format. Allowed formats: {string.Join(", ", allowedExtensions)}"));
        }

        var result = await _uploadService.UploadImageAsync(file, "skillmetrix/images");
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<string>(result.Value!, "Image uploaded"));
    }
}
