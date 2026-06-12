using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons.QA;

/// <summary>
/// Quản lý hệ thống Hỏi đáp / Thảo luận (Câu hỏi, Trả lời) của từng Bài học.
/// </summary>
/// <remarks>
/// Tính năng này đóng vai trò như một diễn đàn thu nhỏ bên trong mỗi bài học. 
/// Học viên và Giảng viên có thể tương tác với nhau thông qua việc đặt câu hỏi và phản hồi (trả lời) lẫn nhau.
/// Cấu trúc định tuyến lồng nhau: `/api/lessons/{lessonId}/questions`.
/// </remarks>
[ApiController]
[Route("api/lessons/{lessonId:guid}/questions")]
[Authorize]
public class LessonQuestionsController(ILessonQAService qaService) : ControllerBase
{
    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }

    /// <summary>
    /// Lấy toàn bộ danh sách câu hỏi thảo luận của một bài học (kèm theo các câu trả lời).
    /// </summary>
    /// <remarks>
    /// Dữ liệu trả về sẽ bao gồm danh sách các Câu hỏi (Questions), bên trong mỗi Câu hỏi sẽ lồng (nest) danh sách các Câu trả lời (Answers) tương ứng.
    /// API này cho phép tất cả những người dùng có quyền truy cập bài học được phép xem toàn bộ nội dung thảo luận.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học.</param>
    /// <returns>Danh sách câu hỏi kèm câu trả lời.</returns>
    /// <response code="200">Lấy danh sách câu hỏi thành công.</response>
    /// <response code="401">Missing/Invalid Token (Người dùng chưa đăng nhập).</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<LessonQuestionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetQuestions(Guid lessonId)
    {
        var questions = await qaService.GetQuestionsAsync(lessonId);
        return Ok(new ApiResponse<IEnumerable<LessonQuestionDto>>(questions, "Questions retrieved"));
    }

    /// <summary>
    /// Tạo (đăng) một câu hỏi thảo luận mới trong bài học.
    /// </summary>
    /// <remarks>
    /// Hệ thống sẽ tự động lấy thông tin người dùng đang đăng nhập làm tác giả (Author) của câu hỏi này.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học.</param>
    /// <param name="dto">Nội dung câu hỏi.</param>
    /// <returns>Thông tin câu hỏi vừa được đăng tải.</returns>
    /// <response code="201">Đăng câu hỏi thành công.</response>
    /// <response code="400">Nội dung câu hỏi không hợp lệ (Bị trống hoặc quá dài).</response>
    /// <response code="401">Missing/Invalid Token.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<LessonQuestionDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateQuestion(Guid lessonId, [FromBody] CreateQuestionDto dto)
    {
        var question = await qaService.CreateQuestionAsync(lessonId, GetUserId(), dto);
        return CreatedAtAction(
            nameof(GetQuestions),
            new { lessonId },
            new ApiResponse<LessonQuestionDto>(question!, "Question posted"))
        ;
    }

    /// <summary>
    /// Xóa một câu hỏi thảo luận.
    /// </summary>
    /// <remarks>
    /// **Ràng buộc an toàn:** Chỉ có **Tác giả** (người tạo ra câu hỏi) hoặc người có thẩm quyền (Giảng viên/Admin) mới có thể xóa câu hỏi này.
    /// Khi một câu hỏi bị xóa, toàn bộ các câu trả lời thuộc về câu hỏi đó cũng có thể bị ẩn/xóa theo logic hệ thống.
    /// </remarks>
    /// <param name="_">Mã định danh của bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Câu hỏi cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa câu hỏi thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy câu hỏi, hoặc người dùng không có quyền xóa câu hỏi này.</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuestion([FromRoute(Name = "lessonId")] Guid _, Guid id)
    {
        var deleted = await qaService.DeleteQuestionAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Question not found"));
        return Ok(new ApiResponse<object>(null!, "Question deleted"));
    }

    /// <summary>
    /// Đăng câu trả lời cho một câu hỏi thảo luận cụ thể.
    /// </summary>
    /// <remarks>
    /// Cho phép mọi học viên hoặc giảng viên đóng góp câu trả lời, phản hồi lại thắc mắc ban đầu của người đặt câu hỏi.
    /// </remarks>
    /// <param name="lessonId">Mã định danh (GUID) của Bài học (Dùng để điều hướng/route).</param>
    /// <param name="questionId">Mã định danh (GUID) của Câu hỏi gốc (Parent Question).</param>
    /// <param name="dto">Nội dung chi tiết của câu trả lời.</param>
    /// <returns>Thông tin câu trả lời vừa được đăng.</returns>
    /// <response code="201">Đăng câu trả lời thành công.</response>
    /// <response code="400">Nội dung trả lời không hợp lệ.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy câu hỏi gốc để trả lời.</response>
    [HttpPost("{questionId:guid}/answers")]
    [ProducesResponseType(typeof(ApiResponse<LessonAnswerDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateAnswer(Guid lessonId, Guid questionId, [FromBody] CreateAnswerDto dto)
    {
        var answer = await qaService.CreateAnswerAsync(questionId, GetUserId(), dto);
        if (answer == null) return NotFound(new ApiResponse<object>(null!, "Question not found"));
        return CreatedAtAction(
            nameof(GetQuestions),
            new { lessonId },
            new ApiResponse<LessonAnswerDto>(answer, "Answer posted"))
        ;
    }

    /// <summary>
    /// Xóa một câu trả lời.
    /// </summary>
    /// <remarks>
    /// Tương tự như Câu hỏi, hệ thống sẽ xác thực quyền: chỉ người trực tiếp viết ra câu trả lời này mới được phép xóa nó.
    /// </remarks>
    /// <param name="_">Mã định danh bài học từ URL.</param>
    /// <param name="id">Mã định danh (GUID) của Câu trả lời cần xóa.</param>
    /// <returns>Trạng thái thực thi thao tác xóa.</returns>
    /// <response code="200">Xóa câu trả lời thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="404">Không tìm thấy câu trả lời, hoặc người dùng không có quyền xóa câu trả lời này.</response>
    [HttpDelete("answers/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAnswer([FromRoute(Name = "lessonId")] Guid _, Guid id)
    {
        var deleted = await qaService.DeleteAnswerAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Answer not found"));
        return Ok(new ApiResponse<object>(null!, "Answer deleted"));
    }
}