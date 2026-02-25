using SkillMetrix_LMS.API.Features.Chapters.DTOs;

namespace SkillMetrix_LMS.API.Features.Chapters;

public interface IChapterService
{
    Task<Result<List<ChapterResponseDto>>> GetChaptersByCourseAsync(Guid courseId);
    Task<Result<ChapterResponseDto>> CreateChapterAsync(Guid courseId, CreateChapterDto dto, Guid actorId);
    Task<Result<ChapterResponseDto>> UpdateChapterAsync(Guid id, UpdateChapterDto dto, Guid actorId);
    Task<Result> DeleteChapterAsync(Guid id, Guid actorId);
}