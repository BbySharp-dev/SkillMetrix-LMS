using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;
using System.Security.Claims;

namespace SkillMetrix_LMS.API.Features.Chapters;

/// <summary>
/// Quản lý chapter thuộc một khóa học.
/// </summary>
/// <remarks>
/// Cung cấp API lấy danh sách chapter và tạo chapter mới theo courseId.
/// </remarks>
[Route("api/courses/{courseId}/chapters")]
public class ChaptersController(IChapterService chapterService) : BaseApiController
{
    private readonly IChapterService _chapterService = chapterService;

    /// <summary>
    /// Lấy danh sách chapter của một khóa học.
    /// </summary>
    /// <param name="courseId">ID khóa học.</param>
    /// <returns>Danh sách chapter theo thứ tự hiển thị.</returns>
    /// <response code="200">Lấy danh sách chapter thành công.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ChapterResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetChapters(Guid courseId)
    {
        var result = await _chapterService.GetChaptersByCourseAsync(courseId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<List<ChapterResponseDto>>(result.Value!, "Chapters retrieved"));
    }

    /// <summary>
    /// Tạo chapter mới cho khóa học.
    /// </summary>
    /// <param name="courseId">ID khóa học.</param>
    /// <param name="dto">Thông tin chapter cần tạo.</param>
    /// <returns>Chapter vừa được tạo.</returns>
    /// <response code="200">Tạo chapter thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="403">Không có quyền tạo chapter cho khóa học này.</response>
    /// <response code="404">Không tìm thấy khóa học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ChapterResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateChapter(Guid courseId, CreateChapterDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _chapterService.CreateChapterAsync(courseId, dto, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<ChapterResponseDto>(result.Value!, "Chapter created"));
    }
}
