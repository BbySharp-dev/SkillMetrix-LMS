namespace SkillMetrix_LMS.API.Shared.Common;

/// <summary>
/// Result pattern - Service layer chỉ trả về kết quả nghiệp vụ
/// Controller sẽ quyết định bọc vào ApiResponse và HTTP Status Code nào dựa trên ErrorType
/// </summary>
public class Result<T>
{
    public bool IsSuccess { get; private set; }
    public T? Value { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public ErrorType ErrorType { get; private set; } = ErrorType.InternalError;

    private Result() { }

    public static Result<T> Success(T value)
    {
        return new Result<T>
        {
            IsSuccess = true,
            Value = value
        };
    }

    public static Result<T> Failure(string errorMessage, ErrorType errorType = ErrorType.BusinessRule)
    {
        return new Result<T>
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorType = errorType
        };
    }

    // Helper methods cho các trường hợp thường dùng
    public static Result<T> NotFound(string errorMessage = "Resource not found")
    {
        return Failure(errorMessage, ErrorType.NotFound);
    }

    public static Result<T> ValidationError(string errorMessage)
    {
        return Failure(errorMessage, ErrorType.ValidationError);
    }

    public static Result<T> Unauthorized(string errorMessage = "Unauthorized")
    {
        return Failure(errorMessage, ErrorType.Unauthorized);
    }

    public static Result<T> Forbidden(string errorMessage = "Forbidden")
    {
        return Failure(errorMessage, ErrorType.Forbidden);
    }

    public static Result<T> Conflict(string errorMessage)
    {
        return Failure(errorMessage, ErrorType.Conflict);
    }

    // Implicit operators: Cho phép return trực tiếp T thay vì Result<T>.Success(T)
    // Giúp code ngắn gọn hơn: return dto; thay vì return Result<T>.Success(dto);
    public static implicit operator Result<T>(T value)
    {
        return Success(value);
    }

    // Implicit operator cho Result<T> -> T (chỉ dùng khi IsSuccess = true)
    public static implicit operator T(Result<T> result)
    {
        return result.Value!;
    }
}

// Overload cho trường hợp không cần trả về data (void operations)
public class Result
{
    public bool IsSuccess { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public ErrorType ErrorType { get; private set; } = ErrorType.InternalError;

    private Result() { }

    public static Result Success()
    {
        return new Result { IsSuccess = true };
    }

    public static Result Failure(string errorMessage, ErrorType errorType = ErrorType.BusinessRule)
    {
        return new Result
        {
            IsSuccess = false,
            ErrorMessage = errorMessage,
            ErrorType = errorType
        };
    }

    // Helper methods cho các trường hợp thường dùng
    public static Result NotFound(string errorMessage = "Resource not found")
    {
        return Failure(errorMessage, ErrorType.NotFound);
    }

    public static Result ValidationError(string errorMessage)
    {
        return Failure(errorMessage, ErrorType.ValidationError);
    }

    public static Result Unauthorized(string errorMessage = "Unauthorized")
    {
        return Failure(errorMessage, ErrorType.Unauthorized);
    }

    public static Result Forbidden(string errorMessage = "Forbidden")
    {
        return Failure(errorMessage, ErrorType.Forbidden);
    }

    public static Result Conflict(string errorMessage)
    {
        return Failure(errorMessage, ErrorType.Conflict);
    }
}