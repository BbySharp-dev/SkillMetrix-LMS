using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Shared;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

[ApiController]
[Route("api/lessons/{lessonId:guid}/notes")]
[Authorize]
public class LessonNotesController : ControllerBase
{
    private readonly ILessonNoteService _noteService;

    public LessonNotesController(ILessonNoteService noteService)
    {
        _noteService = noteService;
    }

    private Guid GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(id!);
    }

    /// <summary>
    /// Lấy tất cả ghi chú của bài học cho user hiện tại.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid lessonId)
    {
        var notes = await _noteService.GetByLessonAsync(lessonId, GetUserId());
        return Ok(new ApiResponse<IEnumerable<LessonNoteResponseDto>>(notes, "Notes retrieved"));
    }

    /// <summary>
    /// Tạo ghi chú mới với timestamp video.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(Guid lessonId, [FromBody] CreateLessonNoteDto dto)
    {
        var note = await _noteService.CreateAsync(lessonId, GetUserId(), dto);
        return CreatedAtAction(
            nameof(GetAll),
            new { lessonId },
            new ApiResponse<LessonNoteResponseDto>(note, "Note created"))
        ;
    }

    /// <summary>
    /// Cập nhật nội dung ghi chú.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid lessonId, Guid id, [FromBody] UpdateLessonNoteDto dto)
    {
        var note = await _noteService.UpdateAsync(id, GetUserId(), dto);
        if (note == null) return NotFound(new ApiResponse<object>(null!, "Note not found"));
        return Ok(new ApiResponse<LessonNoteResponseDto>(note, "Note updated"));
    }

    /// <summary>
    /// Xóa ghi chú.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid lessonId, Guid id)
    {
        var deleted = await _noteService.DeleteAsync(id, GetUserId());
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Note not found"));
        return Ok(new ApiResponse<object>(null!, "Note deleted"));
    }
}
