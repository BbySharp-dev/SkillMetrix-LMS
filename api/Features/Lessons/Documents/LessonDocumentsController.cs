using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.Documents;

/// <summary>
/// Quản lý Tài liệu đính kèm của Bài học (Lesson Documents).
/// </summary>
/// <remarks>
/// Tài liệu đính kèm có thể là file PDF, file nén (.zip) chứa source code, hoặc các đường link tham khảo bên ngoài.
/// Controller này được thiết kế theo chuẩn RESTful lồng nhau: `/api/lessons/{lessonId}/documents`.
/// </remarks>
[ApiController]
[Route("api/lessons/{lessonId:guid}/documents")]
[Authorize]
public class LessonDocumentsController(ILessonDocumentService docService) : ControllerBase
{
    /// <summary>
    /// Lấy danh sách tài liệu đính kèm của một bài học.
    /// </summary>
    /// <remarks>
    /// Trả về danh sách tất cả các tài liệu bổ trợ cho bài học. API này cho phép tất cả người dùng đã đăng nhập (bao gồm Học viên đang học khóa này) truy cập để tải/xem tài liệu.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học.</param>
    /// <returns>Danh sách tài liệu đính kèm.</returns>
    /// <response code="200">Lấy danh sách tài liệu thành công.</response>
    /// <response code="401">Missing/Invalid Token (Người dùng chưa đăng nhập).</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LessonDocumentResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var docs = await docService.GetByLessonIdAsync(lessonId);
        return Ok(new ApiResponse<IEnumerable<LessonDocumentResponseDto>>(docs, "Documents retrieved"));
    }

    /// <summary>
    /// Lấy thông tin chi tiết của một tài liệu đính kèm.
    /// </summary>
    /// <remarks>
    /// Lấy thông tin metadata của tài liệu (tên, định dạng, URL tải xuống) dựa trên ID của tài liệu đó.
    /// </remarks>
    /// <param name="_">Mã định danh của bài học từ URL (bỏ qua trong logic).</param>
    /// <param name="id">Mã định danh (GUID) của Tài liệu cần lấy chi tiết.</param>
    /// <returns>Thông tin chi tiết của tài liệu.</returns>
    /// <response code="200">Lấy thông tin tài liệu thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy tài liệu.</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<LessonDocumentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById([FromRoute(Name = "lessonId")] Guid _, Guid id)
    {
        var doc = await docService.GetByIdAsync(id);
        if (doc == null) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<LessonDocumentResponseDto>(doc, "Document retrieved"));
    }

    /// <summary>
    /// Thêm tài liệu đính kèm mới vào bài học.
    /// </summary>
    /// <remarks>
    /// **Phân quyền:** Chỉ có **Giảng viên (Instructor)** hoặc **Quản trị viên (Admin)** mới được phép gọi API này.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học cần thêm tài liệu.</param>
    /// <param name="dto">Thông tin tài liệu mới (Tên, URL file, thứ tự hiển thị...).</param>
    /// <returns>Thông tin tài liệu vừa được khởi tạo.</returns>
    /// <response code="201">Thêm tài liệu thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Instructor/Admin mới có quyền).</response>
    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    [ProducesResponseType(typeof(ApiResponse<LessonDocumentResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(Guid lessonId, [FromBody] CreateLessonDocumentDto dto)
    {
        var doc = await docService.CreateAsync(lessonId, dto);
        return CreatedAtAction(
            nameof(GetById),
            new { lessonId, id = doc.Id },
            new ApiResponse<LessonDocumentResponseDto>(doc, "Document added"))
        ;
    }

    /// <summary>
    /// Cập nhật thông tin tài liệu đính kèm.
    /// </summary>
    /// <remarks>
    /// Cho phép đổi tên tài liệu, thay đổi file URL hoặc cập nhật thứ tự hiển thị của tài liệu đó.
    /// **Phân quyền:** Chỉ dành cho **Giảng viên (Instructor)** hoặc **Quản trị viên (Admin)**.
    /// </remarks>
    /// <param name="_">Mã định danh của bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Tài liệu cần cập nhật.</param>
    /// <param name="dto">Dữ liệu cần cập nhật.</param>
    /// <returns>Thông tin tài liệu sau khi cập nhật.</returns>
    /// <response code="200">Cập nhật tài liệu thành công.</response>
    /// <response code="400">Dữ liệu cập nhật không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Instructor/Admin mới có quyền).</response>
    /// <response code="404">Không tìm thấy tài liệu để cập nhật.</response>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Instructor")]
    [ProducesResponseType(typeof(ApiResponse<LessonDocumentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update([FromRoute(Name = "lessonId")] Guid _, Guid id, [FromBody] UpdateLessonDocumentDto dto)
    {
        var doc = await docService.UpdateAsync(id, dto);
        if (doc == null) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<LessonDocumentResponseDto>(doc, "Document updated"));
    }

    /// <summary>
    /// Xóa tài liệu đính kèm (Xóa mềm).
    /// </summary>
    /// <remarks>
    /// Đánh dấu tài liệu là đã xóa (IsDeleted = true) thay vì xóa vật lý khỏi hệ thống, giúp có thể khôi phục khi cần thiết.
    /// **Phân quyền:** Chỉ dành cho **Giảng viên (Instructor)** hoặc **Quản trị viên (Admin)**.
    /// </remarks>
    /// <param name="_">Mã định danh của bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Tài liệu cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa tài liệu thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Chỉ Instructor/Admin mới có quyền).</response>
    /// <response code="404">Không tìm thấy tài liệu để xóa.</response>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Instructor")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromRoute(Name = "lessonId")] Guid _, Guid id)
    {
        var deleted = await docService.DeleteAsync(id);
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<object>(null!, "Document deleted"));
    }
}