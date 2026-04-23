namespace SkillMetrix_LMS.API.Features.Upload;

public interface IFileUploadService
{
    Task<Result<string>> UploadImageAsync(IFormFile file, string folder);
    Task<Result<string>> UploadVideoAsync(IFormFile file, string folder);
}
