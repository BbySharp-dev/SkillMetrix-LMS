using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

/// <summary>
/// Quản lý Lịch sử Giao dịch và Thanh toán (Payment Transactions).
/// </summary>
/// <remarks>
/// Cung cấp API để học viên có thể tra cứu lại toàn bộ lịch sử thanh toán, các hóa đơn mua khóa học và trạng thái của từng giao dịch (Thành công, Thất bại, Đang chờ xử lý).
/// </remarks>
[Route("api/transactions")]
[ApiController]
public class TransactionsController(ITransactionService transactionService) : BaseApiController
{
    /// <summary>
    /// Lấy danh sách lịch sử giao dịch của người dùng hiện tại (Hỗ trợ phân trang).
    /// </summary>
    /// <remarks>
    /// Trả về danh sách các giao dịch thanh toán của chính tài khoản đang đăng nhập.
    /// - Dữ liệu luôn được **sắp xếp mặc định theo thời gian giảm dần** (Giao dịch mới nhất hiển thị lên đầu).
    /// - Thường được tích hợp trong trang **"Lịch sử mua hàng" (Purchase History / Billing)** của Học viên.
    /// </remarks>
    /// <param name="query">Các tiêu chí lọc động (Ví dụ: lọc theo khoảng thời gian, trạng thái giao dịch) và thiết lập phân trang.</param>
    /// <returns>Danh sách giao dịch đã được phân trang, kèm theo thông tin cơ bản của khóa học liên quan.</returns>
    /// <response code="200">Lấy danh sách lịch sử giao dịch thành công.</response>
    /// <response code="401">Missing/Invalid Token (Người dùng chưa đăng nhập).</response>
    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<List<TransactionResponseDto>>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTransactions([FromQuery] TransactionQueryDto query)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await transactionService.GetUserTransactionsAsync(userId.Value, query);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<PagedResponse<List<TransactionResponseDto>>>(result.Value!, "Transactions retrieved successfully."));
    }
}