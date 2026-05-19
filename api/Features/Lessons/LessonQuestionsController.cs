using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Shared;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

[ApiController]
[Route("api/lessons/{lessonId:guid}/questions")]
[Authorize]
public class LessonQuestionsController : ControllerBase
{
    private readonly ILessonQAService _qaService;

    public LessonQuestionsController(ILessonQAService qaService)
    {
        _qaService = qaService;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }

    /// <summary>
    /// Lấy tất cả câu hỏi của một bài học (kèm câu trả lời).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetQuestions(Guid lessonId)
    {
        var questions = await _qaService.GetQuestionsAsync(lessonId);
        return Ok(new ApiResponse<IEnumerable<LessonQuestionDto>>(questions, "Questions retrieved"));
    }

    /// <summary>
    /// Tạo câu hỏi mới.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateQuestion(Guid lessonId, [FromBody] CreateQuestionDto dto)
    {
        var question = await _qaService.CreateQuestionAsync(lessonId, GetUserId(), dto);
        return CreatedAtAction(
            nameof(GetQuestions),
            new { lessonId },
            new ApiResponse<LessonQuestionDto>(question!, "Question posted"))
        ;
    }

    /// <summary>
    /// Xóa câu hỏi (chỉ người tạo).
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteQuestion(Guid lessonId, Guid id)
    {
        var deleted = await _qaService.DeleteQuestionAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Question not found"));
        return Ok(new ApiResponse<object>(null!, "Question deleted"));
    }

    /// <summary>
    /// Trả lời một câu hỏi.
    /// </summary>
    [HttpPost("{questionId:guid}/answers")]
    public async Task<IActionResult> CreateAnswer(Guid lessonId, Guid questionId, [FromBody] CreateAnswerDto dto)
    {
        var answer = await _qaService.CreateAnswerAsync(questionId, GetUserId(), dto);
        if (answer == null) return NotFound(new ApiResponse<object>(null!, "Question not found"));
        return CreatedAtAction(
            nameof(GetQuestions),
            new { lessonId },
            new ApiResponse<LessonAnswerDto>(answer, "Answer posted"))
        ;
    }

    /// <summary>
    /// Xóa câu trả lời (chỉ người tạo).
    /// </summary>
    [HttpDelete("answers/{id:guid}")]
    public async Task<IActionResult> DeleteAnswer(Guid lessonId, Guid id)
    {
        var deleted = await _qaService.DeleteAnswerAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Answer not found"));
        return Ok(new ApiResponse<object>(null!, "Answer deleted"));
    }
}
