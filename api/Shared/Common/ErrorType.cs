namespace SkillMetrix_LMS.API.Shared.Common;

/// <summary>
/// Phân loại lỗi để Controller quyết định HTTP Status Code phù hợp
/// </summary>
public enum ErrorType
{
    NotFound = 1,           // Resource không tồn tại -> 404
    ValidationError = 2,    // Dữ liệu không hợp lệ -> 400
    Unauthorized = 3,       // Chưa đăng nhập -> 401
    Forbidden = 4,          // Không có quyền -> 403
    Conflict = 5,           // Xung đột (ví dụ: duplicate) -> 409
    BusinessRule = 6,       // Vi phạm business rule -> 400
    InternalError = 7      // Lỗi hệ thống -> 500
}