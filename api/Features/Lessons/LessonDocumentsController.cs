using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Models;
using SkillMetrix_LMS.API.Shared;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

[ApiController]
[Route("api/lessons/{lessonId:guid}/documents")]
[Authorize]
public class LessonDocumentsController : ControllerBase
{
    private readonly ILessonDocumentService _docService;

    public LessonDocumentsController(ILessonDocumentService docService)
    {
        _docService = docService;
    }

    /// <summary>
    /// Lấy danh sách tài liệu của một bài học.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var docs = await _docService.GetByLessonIdAsync(lessonId);
        return Ok(new ApiResponse<IEnumerable<LessonDocumentResponseDto>>(docs, "Documents retrieved"));
    }

    /// <summary>
    /// Lấy chi tiết một tài liệu.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid lessonId, Guid id)
    {
        var doc = await _docService.GetByIdAsync(id);
        if (doc == null) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<LessonDocumentResponseDto>(doc, "Document retrieved"));
    }

    /// <summary>
    /// Thêm tài liệu mới vào bài học.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Create(Guid lessonId, [FromBody] CreateLessonDocumentDto dto)
    {
        var doc = await _docService.CreateAsync(lessonId, dto);
        return CreatedAtAction(
            nameof(GetById),
            new { lessonId, id = doc.Id },
            new ApiResponse<LessonDocumentResponseDto>(doc, "Document added"))
        ;
    }

    /// <summary>
    /// Cập nhật tài liệu (đổi title, thứ tự).
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Update(Guid lessonId, Guid id, [FromBody] UpdateLessonDocumentDto dto)
    {
        var doc = await _docService.UpdateAsync(id, dto);
        if (doc == null) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<LessonDocumentResponseDto>(doc, "Document updated"));
    }

    /// <summary>
    /// Xóa tài liệu (soft delete).
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Instructor")]
    public async Task<IActionResult> Delete(Guid lessonId, Guid id)
    {
        var deleted = await _docService.DeleteAsync(id);
        if (!deleted) return NotFound(new ApiResponse<object>(null!, "Document not found"));
        return Ok(new ApiResponse<object>(null!, "Document deleted"));
    }
}
