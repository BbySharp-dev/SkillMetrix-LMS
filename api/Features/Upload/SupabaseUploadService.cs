using System.Net.Http.Headers;

namespace SkillMetrix_LMS.API.Features.Upload;

public class SupabaseUploadService(IConfiguration configuration, HttpClient httpClient) : IFileUploadService
{
    private readonly string _supabaseUrl = (configuration["Supabase:Url"] ?? "").TrimEnd('/');
    private readonly string _serviceRoleKey = configuration["Supabase:ServiceRoleKey"] ?? "";
    private readonly string _bucketName = configuration["Supabase:BucketName"] ?? "skillmetrix";

    public async Task<Result<string>> UploadImageAsync(IFormFile file, string folder)
    {
        return await UploadAsync(file, folder);
    }

    public async Task<Result<(string Url, double DurationSeconds)>> UploadVideoAsync(IFormFile file, string folder)
    {
        var urlResult = await UploadAsync(file, folder);
        if (!urlResult.IsSuccess)
        {
            return Result<(string, double)>.Failure(urlResult.ErrorMessage!, urlResult.ErrorType);
        }
        return (urlResult.Value!, 0);
    }

    private async Task<Result<string>> UploadAsync(IFormFile file, string folder)
    {
        if (file == null || file.Length == 0)
        {
            return Result<string>.ValidationError("Empty file");
        }

        if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_serviceRoleKey))
        {
            return Result<string>.Failure("Supabase configuration is missing", ErrorType.InternalError);
        }

        try
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            var fileName = $"{Guid.NewGuid()}{extension}";
            var key = $"{folder.Trim('/')}/{fileName}";

            var requestUrl = $"{_supabaseUrl}/storage/v1/object/{_bucketName}/{key}";
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
            
            // Set authorization and headers
            request.Headers.Add("Authorization", $"Bearer {_serviceRoleKey}");
            request.Headers.Add("x-upsert", "true");

            // Set content stream
            using var stream = file.OpenReadStream();
            var content = new StreamContent(stream);
            content.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");
            request.Content = content;

            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                return Result<string>.Failure($"Supabase Upload failed with status {response.StatusCode}: {errorText}", ErrorType.InternalError);
            }

            // Public URL schema for Supabase Storage: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[key]
            var publicUrl = $"{_supabaseUrl}/storage/v1/object/public/{_bucketName}/{key}";
            return publicUrl;
        }
        catch (Exception ex)
        {
            return Result<string>.Failure($"Supabase Upload Error: {ex.Message}", ErrorType.InternalError);
        }
    }
}
