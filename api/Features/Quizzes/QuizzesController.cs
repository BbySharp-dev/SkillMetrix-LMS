using SkillMetrix_LMS.API.Features.Quizzes.DTOs;

namespace SkillMetrix_LMS.API.Features.Quizzes;

/// <summary>
/// Quản lý Hệ thống Bài trắc nghiệm (Quizzes).
/// </summary>
/// <remarks>
/// Bao gồm 2 luồng nghiệp vụ chính:
/// - **Quản lý (Instructor/Admin):** Tạo, sửa, xóa Quiz, hệ thống Câu hỏi (Questions) và Đáp án (Options).
/// - **Làm bài (Student):** Lấy đề bài (đã ẩn đáp án đúng), bắt đầu tính giờ, nộp bài, chấm điểm tự động và xem lịch sử làm bài.
/// </remarks>
[Route("api/[controller]")]
[Authorize]
[ApiController]
public class QuizzesController(IQuizService quizService) : BaseApiController
{
    // ─── Quiz CRUD (Instructor / Admin) ────────────────────────────────────────

    /// <summary>
    /// Lấy danh sách các Bài trắc nghiệm (Quiz) của một Khóa học.
    /// </summary>
    /// <remarks>
    /// Dành cho Giảng viên hoặc Quản trị viên xem danh sách các bài test đang có trong khóa học của mình.
    /// </remarks>
    /// <param name="courseId">Mã định danh (GUID) của Khóa học.</param>
    /// <returns>Danh sách các Quiz thuộc khóa học.</returns>
    /// <response code="200">Lấy danh sách thành công.</response>
    /// <response code="401">Missing/Invalid Token.</response>
    /// <response code="403">Truy cập bị từ chối (Không phải Giảng viên của khóa học này).</response>
    [HttpGet("course/{courseId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<List<QuizResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetQuizzesByCourse(Guid courseId)
    {
        var actorId = GetCurrentUserId();
        var result = await quizService.GetQuizzesByCourseAsync(courseId, actorId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<List<QuizResponseDto>>(result.Value!, "Quizzes retrieved"));
    }

    /// <summary>
    /// Lấy chi tiết toàn bộ cấu trúc của một Bài trắc nghiệm.
    /// </summary>
    /// <remarks>
    /// Trả về dữ liệu cây phân cấp: **Quiz -> Danh sách Câu hỏi (Questions) -> Danh sách Đáp án (Options)**.
    /// Bao gồm cả cờ báo đáp án đúng (`IsCorrect`) phục vụ cho giao diện chỉnh sửa của Giảng viên.
    /// </remarks>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <returns>Chi tiết bài trắc nghiệm.</returns>
    /// <response code="200">Lấy dữ liệu thành công.</response>
    /// <response code="404">Không tìm thấy bài trắc nghiệm.</response>
    [HttpGet("{quizId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<QuizDetailResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetQuiz(Guid quizId)
    {
        var actorId = GetCurrentUserId();
        var result = await quizService.GetQuizByIdAsync(quizId, actorId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizDetailResponseDto>(result.Value!, "Quiz retrieved"));
    }

    /// <summary>
    /// Tạo mới một Bài trắc nghiệm.
    /// </summary>
    /// <param name="dto">Thông tin cơ bản của Quiz (Tiêu đề, Thời gian làm bài, Điểm đạt...).</param>
    /// <returns>Thông tin Quiz vừa khởi tạo.</returns>
    /// <response code="201">Tạo thành công.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ.</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<QuizResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.CreateQuizAsync(dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId = result.Value!.Id },
            new ApiResponse<QuizResponseDto>(result.Value, "Quiz created successfully"));
    }

    /// <summary>
    /// Cập nhật cấu hình của một Bài trắc nghiệm.
    /// </summary>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <param name="dto">Dữ liệu cập nhật.</param>
    /// <returns>Thông tin Quiz sau cập nhật.</returns>
    /// <response code="200">Cập nhật thành công.</response>
    /// <response code="404">Không tìm thấy bài trắc nghiệm.</response>
    [HttpPut("{quizId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<QuizResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuiz(Guid quizId, [FromBody] UpdateQuizDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.UpdateQuizAsync(quizId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizResponseDto>(result.Value!, "Quiz updated successfully"));
    }

    /// <summary>
    /// Xóa Bài trắc nghiệm khỏi khóa học.
    /// </summary>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <returns>Trạng thái xóa.</returns>
    /// <response code="204">Xóa thành công (Không trả về content).</response>
    /// <response code="404">Không tìm thấy bài trắc nghiệm.</response>
    [HttpDelete("{quizId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuiz(Guid quizId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.DeleteQuizAsync(quizId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Question CRUD ────────────────────────────────────────────────────────

    /// <summary>
    /// Thêm một Câu hỏi (Question) mới vào Bài trắc nghiệm.
    /// </summary>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <param name="dto">Nội dung câu hỏi, loại câu hỏi (Single/Multiple Choice) và số điểm.</param>
    /// <returns>Thông tin câu hỏi vừa tạo.</returns>
    [HttpPost("{quizId:guid}/questions")]
    [ProducesResponseType(typeof(ApiResponse<QuestionResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddQuestion(Guid quizId, [FromBody] CreateQuestionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.AddQuestionAsync(quizId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId },
            new ApiResponse<QuestionResponseDto>(result.Value!, "Question added successfully"));
    }

    /// <summary>
    /// Cập nhật nội dung một Câu hỏi.
    /// </summary>
    [HttpPut("{quizId:guid}/questions/{questionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<QuestionResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateQuestion(Guid quizId, Guid questionId, [FromBody] UpdateQuestionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.UpdateQuestionAsync(quizId, questionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuestionResponseDto>(result.Value!, "Question updated successfully"));
    }

    /// <summary>
    /// Xóa một Câu hỏi khỏi Bài trắc nghiệm.
    /// </summary>
    [HttpDelete("{quizId:guid}/questions/{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteQuestion(Guid quizId, Guid questionId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.DeleteQuestionAsync(quizId, questionId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Option CRUD ──────────────────────────────────────────────────────────

    /// <summary>
    /// Thêm Tùy chọn (Đáp án) cho một Câu hỏi cụ thể.
    /// </summary>
    [HttpPost("{quizId:guid}/questions/{questionId:guid}/options")]
    [ProducesResponseType(typeof(ApiResponse<OptionResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddOption(Guid quizId, Guid questionId, [FromBody] CreateOptionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.AddOptionAsync(quizId, questionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId },
            new ApiResponse<OptionResponseDto>(result.Value!, "Option added successfully"));
    }

    /// <summary>
    /// Cập nhật nội dung Tùy chọn (Ví dụ: Chuyển từ đáp án sai thành đáp án đúng).
    /// </summary>
    [HttpPut("{quizId:guid}/questions/{questionId:guid}/options/{optionId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<OptionResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateOption(Guid quizId, Guid questionId, Guid optionId, [FromBody] UpdateOptionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.UpdateOptionAsync(quizId, questionId, optionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<OptionResponseDto>(result.Value!, "Option updated successfully"));
    }

    /// <summary>
    /// Xóa một Tùy chọn (Đáp án).
    /// </summary>
    [HttpDelete("{quizId:guid}/questions/{questionId:guid}/options/{optionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteOption(Guid quizId, Guid questionId, Guid optionId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.DeleteOptionAsync(quizId, questionId, optionId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Quiz Taking (Student) ────────────────────────────────────────────────

    /// <summary>
    /// Lấy Đề thi (Quiz) để Học viên làm bài.
    /// </summary>
    /// <remarks>
    /// **Tính năng chống gian lận:** Toàn bộ cờ `IsCorrect` trong danh sách đáp án sẽ bị API này loại bỏ trước khi trả về cho Client.
    /// Học viên phải được xác thực là đã Ghi danh (Enroll) khóa học mới được phép lấy đề.
    /// </remarks>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <returns>Cấu trúc đề bài (Không có thông tin đáp án đúng).</returns>
    /// <response code="200">Tải đề thành công.</response>
    /// <response code="403">Truy cập bị từ chối (Chưa đăng ký khóa học).</response>
    [HttpGet("{quizId:guid}/take")]
    [ProducesResponseType(typeof(ApiResponse<QuizForTakingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetQuizForTaking(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.GetQuizForTakingAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizForTakingDto>(result.Value!, "Quiz loaded"));
    }

    /// <summary>
    /// Bắt đầu tính giờ cho một lượt làm bài (Attempt).
    /// </summary>
    /// <remarks>
    /// Hệ thống sẽ tạo ra một bản ghi `Attempt` trong CSDL để lưu lại thời điểm bắt đầu (StartTime). 
    /// Client cần gọi API này trước khi cho phép user tương tác với các câu hỏi.
    /// </remarks>
    /// <param name="quizId">Mã định danh (GUID) của Quiz.</param>
    /// <returns>Mã định danh của Lượt làm bài (`AttemptId`) để dùng cho lúc nộp bài.</returns>
    /// <response code="201">Khởi tạo lượt làm bài thành công.</response>
    [HttpPost("{quizId:guid}/attempts")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<IActionResult> StartAttempt(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.StartAttemptAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return StatusCode(201, new ApiResponse<Guid>(result.Value!, "Quiz attempt started"));
    }

    /// <summary>
    /// Nộp bài trắc nghiệm và kích hoạt chấm điểm tự động.
    /// </summary>
    /// <remarks>
    /// Học viên gửi lên danh sách các đáp án đã chọn. Hệ thống sẽ:
    /// - Chốt thời gian nộp bài (`EndTime`).
    /// - Kiểm tra độ hợp lệ của thời gian (chống hack thời gian).
    /// - Chấm điểm tự động và lưu lịch sử.
    /// </remarks>
    /// <param name="quizId">Mã định danh của Quiz.</param>
    /// <param name="attemptId">Mã định danh lượt làm bài (Lấy từ API StartAttempt).</param>
    /// <param name="answers">Danh sách mảng ánh xạ giữa `QuestionId` và các `OptionId` đã chọn.</param>
    /// <returns>Kết quả chấm điểm chi tiết (Đậu/Rớt, Tổng điểm, Số câu đúng).</returns>
    /// <response code="200">Nộp bài và chấm điểm thành công.</response>
    /// <response code="400">Dữ liệu nộp bài không hợp lệ hoặc đã quá thời gian cho phép.</response>
    [HttpPost("{quizId:guid}/attempts/{attemptId:guid}/submit")]
    [ProducesResponseType(typeof(ApiResponse<QuizAttemptResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitAttempt(Guid quizId, Guid attemptId, [FromBody] List<SubmitAnswerDto> answers)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.SubmitAttemptAsync(attemptId, answers, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizAttemptResultDto>(result.Value!, "Quiz submitted"));
    }

    /// <summary>
    /// Lấy lịch sử các lượt làm bài của Học viên đối với một Quiz.
    /// </summary>
    /// <remarks>
    /// Dùng để hiển thị bảng tóm tắt lịch sử (Ví dụ: Lần 1 được 80 điểm, Lần 2 được 100 điểm).
    /// </remarks>
    /// <param name="quizId">Mã định danh của Quiz.</param>
    /// <returns>Danh sách các lần làm bài đã nộp.</returns>
    [HttpGet("{quizId:guid}/attempts")]
    [ProducesResponseType(typeof(ApiResponse<List<QuizAttemptSummaryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserAttempts(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.GetUserAttemptsAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<List<QuizAttemptSummaryDto>>(result.Value!, "Attempts retrieved"));
    }

    /// <summary>
    /// Xem chi tiết kết quả của một lượt làm bài đã nộp.
    /// </summary>
    /// <remarks>
    /// Trả về toàn bộ chi tiết: Câu nào trả lời đúng, câu nào sai, đáp án thực sự là gì. Dùng cho tính năng "Xem lại bài thi" (Review).
    /// </remarks>
    /// <param name="quizId">Mã định danh của Quiz.</param>
    /// <param name="attemptId">Mã định danh của lượt làm bài cần xem.</param>
    /// <returns>Chi tiết kết quả chấm điểm.</returns>
    /// <response code="200">Lấy dữ liệu kết quả thành công.</response>
    /// <response code="404">Không tìm thấy lượt làm bài này.</response>
    [HttpGet("{quizId:guid}/attempts/{attemptId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<QuizAttemptResultDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAttemptResult(Guid quizId, Guid attemptId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized(new ApiResponse<object>("Invalid token"));

        var result = await quizService.GetAttemptResultAsync(attemptId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizAttemptResultDto>(result.Value!, "Attempt result retrieved"));
    }
}