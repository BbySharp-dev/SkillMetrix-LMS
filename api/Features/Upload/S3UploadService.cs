using Amazon.S3;
using Amazon.S3.Transfer;

namespace SkillMetrix_LMS.API.Features.Upload;

public class S3UploadService(IAmazonS3 s3Client, IConfiguration configuration) : IFileUploadService
{
    public async Task<Result<string>> UploadImageAsync(IFormFile file, string folder)
    {
        return await UploadAsync(file, folder);
    }

    public async Task<Result<(string Url, double DurationSeconds)>> UploadVideoAsync(IFormFile file, string folder)
    {
        // S3 doesn't return video duration from upload — set to 0 and require manual update
        var urlResult = await UploadAsync(file, folder);
        if (!urlResult.IsSuccess)
            return Result<(string, double)>.Failure(urlResult.ErrorMessage!, urlResult.ErrorType);
        return (urlResult.Value!, 0);
    }

    private async Task<Result<string>> UploadAsync(IFormFile? file, string folder)
    {
        if (file == null || file.Length == 0)
        {
            return Result<string>.ValidationError("Empty file");
        }

        var bucket = configuration["AwsS3:BucketName"];
        var region = configuration["AwsS3:Region"];

        if (string.IsNullOrWhiteSpace(bucket) || string.IsNullOrWhiteSpace(region))
        {
            return Result<string>.Failure("S3 configuration is missing", ErrorType.InternalError);
        }

        var key = $"{folder}/{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";

        await using var stream = file.OpenReadStream();
        var uploadRequest = new TransferUtilityUploadRequest
        {
            InputStream = stream,
            Key = key,
            BucketName = bucket,
            ContentType = file.ContentType
        };

        var transfer = new TransferUtility(s3Client);
        await transfer.UploadAsync(uploadRequest);

        var url = $"https://{bucket}.s3.{region}.amazonaws.com/{key}";
        return url;
    }
}
