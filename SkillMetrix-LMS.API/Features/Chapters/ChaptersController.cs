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

    /// <summary>
    /// Cập nhật thông tin chapter.
    /// </summary>
    /// <param name="courseId">ID khóa học.</param>
    /// <param name="id">ID của chapter cần cập nhật.</param>
    /// <param name="dto">Thông tin cần cập nhật.</param>
    /// <returns>Thông tin chapter sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật chapter thành công.</response>
    /// <response code="400">Thông tin cung cấp không hợp lệ.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="403">Không có quyền cập nhật chapter này.</response>
    /// <response code="404">Không tìm thấy chapter.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<ChapterResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateChapter(Guid courseId, Guid id, UpdateChapterDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _chapterService.UpdateChapterAsync(id, dto, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<ChapterResponseDto>(result.Value!, "Chapter updated"));
    }

    /// <summary>
    /// Xóa một chapter (xóa mềm).
    /// </summary>
    /// <param name="courseId">ID khóa học.</param>
    /// <param name="id">ID của chapter cần xóa.</param>
    /// <returns>Trạng thái thực thi.</returns>
    /// <response code="200">Xóa chapter thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    /// <response code="403">Không có quyền xóa chapter này.</response>
    /// <response code="404">Không tìm thấy chapter.</response>
    /// <response code="409">Không thể xóa chapter vì vẫn còn bài học bên trong.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteChapter(Guid courseId, Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _chapterService.DeleteChapterAsync(id, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Chapter deleted"));
    }

    /// <summary>
    /// Thay đổi thứ tự (reorder) của một chapter trong khóa học.
    /// </summary>
    /// <param name="courseId">ID khóa học.</param>
    /// <param name="id">ID của chapter cần thay đổi vị trí.</param>
    /// <param name="dto">Thông tin vị trí cũ và vị trí mới.</param>
    /// <returns>Trạng thái cập nhật.</returns>
    /// <response code="200">Thay đổi thứ tự chương học thành công.</response>
    /// <response code="400">Dữ liệu không hợp lệ (ví dụ: NewIndex nằm ngoài phạm vi).</response>
    /// <response code="401">Không có quyền truy cập (Token không hợp lệ).</response>
    /// <response code="403">Không có quyền cập nhật khóa học này (Chỉ Instructor hoặc Admin).</response>
    /// <response code="404">Không tìm thấy chương học hoặc khóa học.</response>
    [Authorize(Policy = "RequireInstructorOrAdmin")]
    [HttpPut("{id}/reorder")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ReorderChapter(Guid courseId, Guid id, ReorderDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var actorId) || actorId == Guid.Empty)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _chapterService.ReorderChapterAsync(courseId, id, dto, actorId);
        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object?>(null, "Chapter reordered"));
    }
}
