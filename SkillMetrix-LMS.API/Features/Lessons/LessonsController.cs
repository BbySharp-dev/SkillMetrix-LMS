using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Features.Lessons;

/// <summary>
/// Quản lý lesson thuộc một chapter và upload video cho lesson.
/// </summary>
/// <remarks>
/// Cung cấp API lấy lesson, tạo lesson và gắn video trực tiếp vào lesson theo chuẩn 1-step upload.
/// </remarks>
[Route("api/chapters/{chapterId}/lessons")]
public class LessonsController(ILessonService lessonService) : BaseApiController
{
    private readonly ILessonService _lessonService = lessonService;

    /// <summary>
    /// Lấy danh sách lesson theo chapter.
    /// </summary>
    /// <param name="chapterId">ID chapter.</param>
    /// <returns>Danh sách lesson thuộc chapter.</returns>
    /// <response code="200">Lấy danh sách lesson thành công.</response>
    /// <response code="404">Không tìm thấy chapter.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<LessonResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetLessons(Guid chapterId)
    {
        var result = await _lessonService.GetLessonsByChapterAsync(chapterId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<List<LessonResponseDto>>(result.Value!, "Lessons retrieved"));
    }

    /// <summary>
    /// Tạo lesson mới (chưa bao gồm video).
    /// </summary>
    /// <param name="chapterId">ID chapter chứa lesson.</param>
    /// <param name="dto">Thông tin lesson cần tạo.</param>
    /// <returns>Lesson vừa được tạo.</returns>
    /// <response code="200">Tạo lesson thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="403">Không có quyền tạo lesson cho chapter này.</response>
    /// <response code="404">Không tìm thấy chapter hoặc course liên quan.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateLesson(Guid chapterId, CreateLessonDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _lessonService.CreateLessonAsync(chapterId, dto, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<LessonResponseDto>(result.Value!, "Lesson created"));
    }

    /// <summary>
    /// Upload video và gắn trực tiếp vào lesson.
    /// </summary>
    /// <param name="chapterId">ID chapter chứa lesson (phục vụ route ngữ cảnh).</param>
    /// <param name="lessonId">ID lesson cần gắn video.</param>
    /// <param name="file">File video dạng multipart/form-data.</param>
    /// <returns>Lesson sau khi cập nhật video.</returns>
    /// <response code="200">Upload video thành công và lesson đã được cập nhật.</response>
    /// <response code="400">File rỗng hoặc định dạng không hợp lệ.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="403">Không có quyền upload video cho lesson này.</response>
    /// <response code="404">Không tìm thấy lesson/chapter/course.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost("{lessonId}/video")]
    [RequestSizeLimit(100_000_000)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ApiResponse<LessonResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadLessonVideo(Guid chapterId, Guid lessonId, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new ApiResponse<string>("No file uploaded."));
        }

        var allowedExtensions = new[] { ".mp4", ".webm", ".avi", ".mov" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
        {
            return BadRequest(new ApiResponse<string>($"Invalid file format. Allowed formats: {string.Join(", ", allowedExtensions)}"));
        }

        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _lessonService.UploadLessonVideoAsync(lessonId, file, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<LessonResponseDto>(result.Value!, "Lesson video uploaded"));
    }
}
