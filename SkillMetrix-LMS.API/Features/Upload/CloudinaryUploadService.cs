using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace SkillMetrix_LMS.API.Features.Upload;

public class CloudinaryUploadService : IFileUploadService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryUploadService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<Result<string>> UploadImageAsync(IFormFile file, string folder)
    {
        if (file.Length == 0)
        {
            return Result<string>.ValidationError("Empty file");
        }

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = folder
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error != null)
        {
            return Result<string>.Failure(result.Error.Message, ErrorType.InternalError);
        }

        return result.SecureUrl.ToString();
    }

    public async Task<Result<string>> UploadVideoAsync(IFormFile file, string folder)
    {
        if (file.Length == 0)
        {
            return Result<string>.ValidationError("Empty file");
        }

        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(file.FileName, file.OpenReadStream()),
            Folder = folder
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error != null)
        {
            return Result<string>.Failure(result.Error.Message, ErrorType.InternalError);
        }

        return result.SecureUrl.ToString();
    }
}