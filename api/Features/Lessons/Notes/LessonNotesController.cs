using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.Notes;

/// <summary>
/// Quản lý Ghi chú cá nhân của Bài học (Lesson Notes).
/// </summary>
/// <remarks>
/// Tính năng này cho phép học viên tự tạo các ghi chú cá nhân trong quá trình học. 
/// Các ghi chú có thể được gán kèm với mốc thời gian (Timestamp) của Video để tiện xem lại.
/// **Lưu ý:** Ghi chú mang tính chất cá nhân, người dùng nào chỉ xem/sửa/xóa được ghi chú của người dùng đó.
/// </remarks>
[ApiController]
[Route("api/lessons/{lessonId:guid}/notes")]
[Authorize]
public class LessonNotesController(ILessonNoteService noteService) : ControllerBase
{
    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }

    /// <summary>
    /// Lấy toàn bộ danh sách ghi chú của người dùng hiện tại trong một bài học.
    /// </summary>
    /// <remarks>
    /// Trả về danh sách ghi chú của chính tài khoản đang đăng nhập, thường được hiển thị ở tab "Ghi chú" bên cạnh Video Player.
    /// Dữ liệu thường được sắp xếp theo thời gian của Video (VideoTimestamp) hoặc thời gian tạo ghi chú.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học.</param>
    /// <returns>Danh sách ghi chú cá nhân.</returns>
    /// <response code="200">Lấy danh sách ghi chú thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LessonNoteResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(Guid lessonId)
    {
        var notes = await noteService.GetByLessonAsync(lessonId, GetUserId());
        return Ok(new ApiResponse<IEnumerable<LessonNoteResponseDto>>(notes, "Notes retrieved"));
    }

    /// <summary>
    /// Tạo một ghi chú mới cho bài học hiện tại.
    /// </summary>
    /// <remarks>
    /// Học viên có thể truyền lên `VideoTimestamp` (ví dụ: "00:05:23" hoặc số giây) để đánh dấu chính xác khoảnh khắc trong video cần lưu ý.
    /// Khi học viên click vào ghi chú này sau đó, Frontend có thể trigger sự kiện tua video tới đúng thời điểm trên.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học.</param>
    /// <param name="dto">Nội dung ghi chú và mốc thời gian video (không bắt buộc).</param>
    /// <returns>Thông tin ghi chú vừa được tạo.</returns>
    /// <response code="201">Tạo ghi chú thành công.</response>
    /// <response code="400">Dữ liệu đầu vào (Nội dung/Timestamp) không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LessonNoteResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create(Guid lessonId, [FromBody] CreateLessonNoteDto dto)
    {
        var note = await noteService.CreateAsync(lessonId, GetUserId(), dto);
        return CreatedAtAction(
            nameof(GetAll),
            new { lessonId },
            new ApiResponse<LessonNoteResponseDto>(note, "Note created"))
        ;
    }

    /// <summary>
    /// Cập nhật nội dung của một ghi chú đã tồn tại.
    /// </summary>
    /// <remarks>
    /// Hệ thống sẽ kiểm tra bảo mật ngễn định: người dùng chỉ được phép cập nhật ghi chú do chính mình tạo ra.
    /// Nếu truyền ID ghi chú của người khác, API sẽ trả về lỗi 404 (Not Found).
    /// </remarks>
    /// <param name="_">Mã định danh bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Ghi chú cần sửa.</param>
    /// <param name="dto">Nội dung ghi chú và/hoặc mốc thời gian mới.</param>
    /// <returns>Thông tin ghi chú sau khi đã cập nhật.</returns>
    /// <response code="200">Cập nhật ghi chú thành công.</response>
    /// <response code="400">Dữ liệu cập nhật không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy ghi chú hoặc ghi chú không thuộc sở hữu của người dùng.</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LessonNoteResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute(Name = "lessonId")] Guid _, Guid id, [FromBody] UpdateLessonNoteDto dto)
    {
        var note = await noteService.UpdateAsync(id, GetUserId(), dto);
        if (note == null) return NotFound(new ApiResponse<object>(null!, "Note not found"));
        return Ok(new ApiResponse<LessonNoteResponseDto>(note, "Note updated"));
    }

    /// <summary>
    /// Xóa một ghi chú cá nhân.
    /// </summary>
    /// <remarks>
    /// Xóa vĩnh viễn ghi chú của học viên khỏi hệ thống. Tương tự như API cập nhật, hệ thống chỉ cho phép xóa ghi chú của chính chủ.
    /// </remarks>
    /// <param name="_">Mã định danh bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Ghi chú cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa ghi chú thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy ghi chú hoặc ghi chú không thuộc sở hữu của người dùng.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute(Name = "lessonId")] Guid _, Guid id)
    {
        var deleted = await noteService.DeleteAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Note not found"));
        return Ok(new ApiResponse<object>(null!, "Note deleted"));
    }
}