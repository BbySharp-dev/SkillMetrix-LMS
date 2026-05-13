using SkillMetrix_LMS.API.Features.Quizzes.DTOs;

namespace SkillMetrix_LMS.API.Features.Quizzes;

[Route("api/[controller]")]
[Authorize]
public class QuizzesController(IQuizService quizService) : BaseApiController
{
    // ─── Quiz CRUD (Instructor / Admin) ────────────────────────────────────────

    [HttpGet("course/{courseId:guid}")]
    [ProducesResponseType(typeof(List<QuizResponseDto>), StatusCodes.Status200OK)]    public async Task<IActionResult> GetQuizzesByCourse(Guid courseId)
    {
        var actorId = GetCurrentUserId();
        var result = await quizService.GetQuizzesByCourseAsync(courseId, actorId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<List<QuizResponseDto>>(result.Value!, "Quizzes retrieved"));
    }

    [HttpGet("{quizId:guid}")]
    [ProducesResponseType(typeof(QuizDetailResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetQuiz(Guid quizId)
    {
        var actorId = GetCurrentUserId();
        var result = await quizService.GetQuizByIdAsync(quizId, actorId);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizDetailResponseDto>(result.Value!, "Quiz retrieved"));
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<QuizResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.CreateQuizAsync(dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId = result.Value!.Id },
            new ApiResponse<QuizResponseDto>(result.Value, "Quiz created successfully"));
    }

    [HttpPut("{quizId:guid}")]
    [ProducesResponseType(typeof(QuizResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateQuiz(Guid quizId, [FromBody] UpdateQuizDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.UpdateQuizAsync(quizId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizResponseDto>(result.Value!, "Quiz updated successfully"));
    }

    [HttpDelete("{quizId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteQuiz(Guid quizId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.DeleteQuizAsync(quizId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Question CRUD ────────────────────────────────────────────────────────

    [HttpPost("{quizId:guid}/questions")]
    [ProducesResponseType(typeof(ApiResponse<QuestionResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddQuestion(Guid quizId, [FromBody] CreateQuestionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.AddQuestionAsync(quizId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId },
            new ApiResponse<QuestionResponseDto>(result.Value!, "Question added successfully"));
    }

    [HttpPut("{quizId:guid}/questions/{questionId:guid}")]
    [ProducesResponseType(typeof(QuestionResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateQuestion(Guid quizId, Guid questionId, [FromBody] UpdateQuestionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.UpdateQuestionAsync(quizId, questionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuestionResponseDto>(result.Value!, "Question updated successfully"));
    }

    [HttpDelete("{quizId:guid}/questions/{questionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteQuestion(Guid quizId, Guid questionId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.DeleteQuestionAsync(quizId, questionId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Option CRUD ──────────────────────────────────────────────────────────

    [HttpPost("{quizId:guid}/questions/{questionId:guid}/options")]
    [ProducesResponseType(typeof(ApiResponse<OptionResponseDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> AddOption(Guid quizId, Guid questionId, [FromBody] CreateOptionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.AddOptionAsync(quizId, questionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);

        return CreatedAtAction(
            nameof(GetQuiz),
            new { quizId },
            new ApiResponse<OptionResponseDto>(result.Value!, "Option added successfully"));
    }

    [HttpPut("{quizId:guid}/questions/{questionId:guid}/options/{optionId:guid}")]
    [ProducesResponseType(typeof(OptionResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateOption(Guid quizId, Guid questionId, Guid optionId, [FromBody] UpdateOptionDto dto)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.UpdateOptionAsync(quizId, questionId, optionId, dto, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<OptionResponseDto>(result.Value!, "Option updated successfully"));
    }

    [HttpDelete("{quizId:guid}/questions/{questionId:guid}/options/{optionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteOption(Guid quizId, Guid questionId, Guid optionId)
    {
        var actorId = GetCurrentUserId();
        if (!actorId.HasValue) return Unauthorized();

        var result = await quizService.DeleteOptionAsync(quizId, questionId, optionId, actorId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return NoContent();
    }

    // ─── Quiz Taking (Student) ────────────────────────────────────────────────

    [HttpGet("{quizId:guid}/take")]
    [ProducesResponseType(typeof(ApiResponse<QuizForTakingDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetQuizForTaking(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await quizService.GetQuizForTakingAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizForTakingDto>(result.Value!, "Quiz loaded"));
    }

    [HttpPost("{quizId:guid}/attempts")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<IActionResult> StartAttempt(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await quizService.StartAttemptAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return StatusCode(201, new ApiResponse<Guid>(result.Value!, "Quiz attempt started"));
    }

    [HttpPost("{quizId:guid}/attempts/{attemptId:guid}/submit")]
    [ProducesResponseType(typeof(ApiResponse<QuizAttemptResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SubmitAttempt(Guid quizId, Guid attemptId, [FromBody] List<SubmitAnswerDto> answers)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await quizService.SubmitAttemptAsync(attemptId, answers, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizAttemptResultDto>(result.Value!, "Quiz submitted"));
    }

    [HttpGet("{quizId:guid}/attempts")]
    [ProducesResponseType(typeof(List<QuizAttemptSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserAttempts(Guid quizId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await quizService.GetUserAttemptsAsync(quizId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<List<QuizAttemptSummaryDto>>(result.Value!, "Attempts retrieved"));
    }

    [HttpGet("{quizId:guid}/attempts/{attemptId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<QuizAttemptResultDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAttemptResult(Guid quizId, Guid attemptId)
    {
        var userId = GetCurrentUserId();
        if (!userId.HasValue) return Unauthorized();

        var result = await quizService.GetAttemptResultAsync(attemptId, userId.Value);
        if (!result.IsSuccess) return HandleError(result);
        return Ok(new ApiResponse<QuizAttemptResultDto>(result.Value!, "Attempt result retrieved"));
    }
}