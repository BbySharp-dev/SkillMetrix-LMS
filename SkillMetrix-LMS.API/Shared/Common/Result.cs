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
        => new Result<T> { IsSuccess = true, Value = value };

    public static Result<T> Failure(string errorMessage, ErrorType errorType = ErrorType.BusinessRule)
        => new Result<T> { IsSuccess = false, ErrorMessage = errorMessage, ErrorType = errorType };

    // ─── Helper methods ───────────────────────────────────────────
    public static Result<T> NotFound(string errorMessage = "Resource not found")
        => Failure(errorMessage, ErrorType.NotFound);

    public static Result<T> ValidationError(string errorMessage)
        => Failure(errorMessage, ErrorType.ValidationError);

    public static Result<T> Unauthorized(string errorMessage = "Unauthorized")
        => Failure(errorMessage, ErrorType.Unauthorized);

    public static Result<T> Forbidden(string errorMessage = "Forbidden")
        => Failure(errorMessage, ErrorType.Forbidden);

    public static Result<T> Conflict(string errorMessage)
        => Failure(errorMessage, ErrorType.Conflict);

    public static Result<T> BusinessRule(string errorMessage)
        => Failure(errorMessage, ErrorType.BusinessRule);

    // ─── Implicit operators ───────────────────────────────────────
    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator T(Result<T> result) => result.Value!;
}

public class Result
{
    public bool IsSuccess { get; private set; }
    public string ErrorMessage { get; private set; } = string.Empty;
    public ErrorType ErrorType { get; private set; } = ErrorType.InternalError;

    private Result() { }

    public static Result Success()
        => new Result { IsSuccess = true };

    public static Result Failure(string errorMessage, ErrorType errorType = ErrorType.BusinessRule)
        => new Result { IsSuccess = false, ErrorMessage = errorMessage, ErrorType = errorType };

    // ─── Helper methods ───────────────────────────────────────────
    public static Result NotFound(string errorMessage = "Resource not found")
        => Failure(errorMessage, ErrorType.NotFound);

    public static Result ValidationError(string errorMessage)
        => Failure(errorMessage, ErrorType.ValidationError);

    public static Result Unauthorized(string errorMessage = "Unauthorized")
        => Failure(errorMessage, ErrorType.Unauthorized);

    public static Result Forbidden(string errorMessage = "Forbidden")
        => Failure(errorMessage, ErrorType.Forbidden);

    public static Result Conflict(string errorMessage)
        => Failure(errorMessage, ErrorType.Conflict);

    public static Result BusinessRule(string errorMessage)
        => Failure(errorMessage, ErrorType.BusinessRule);
}