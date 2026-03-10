using Amazon.S3;
using Amazon.S3.Transfer;

namespace SkillMetrix_LMS.API.Features.Upload;

public class S3UploadService(IAmazonS3 s3Client, IConfiguration configuration) : IFileUploadService
{
    private readonly IAmazonS3 _s3Client = s3Client;
    private readonly IConfiguration _configuration = configuration;

    public async Task<Result<string>> UploadImageAsync(IFormFile file, string folder)
    {
        return await UploadAsync(file, folder);
    }

    public async Task<Result<string>> UploadVideoAsync(IFormFile file, string folder)
    {
        return await UploadAsync(file, folder);
    }

    private async Task<Result<string>> UploadAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
        {
            return Result<string>.ValidationError("Empty file");
        }

        var bucket = _configuration["AwsS3:BucketName"];
        var region = _configuration["AwsS3:Region"];

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

        var transfer = new TransferUtility(_s3Client);
        await transfer.UploadAsync(uploadRequest);

        var url = $"https://{bucket}.s3.{region}.amazonaws.com/{key}";
        return url;
    }
}
