namespace SkillMetrix_LMS.API.Shared.Common;

/// <summary>
/// Standardized API response - chỉ dùng trong Controller
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public ApiResponse() { }

    public ApiResponse(T data, string message = "Operation successful")
    {
        Success = true;
        Data = data;
        Message = message;
    }

    public ApiResponse(string message, List<string>? errors = null)
    {
        Success = false;
        Message = message;
        Errors = errors;
    }
}