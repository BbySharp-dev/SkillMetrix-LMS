using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

/// <summary>
/// Controller quản lý lịch sử giao dịch thanh toán (Transaction).
/// Tất cả endpoint yêu cầu xác thực JWT.
/// </summary>
[Route("api/transactions")]
public class TransactionsController : BaseApiController
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    /// <summary>
    /// Lấy danh sách giao dịch của user hiện tại, sắp xếp mới nhất lên trước.
    /// </summary>
    /// <returns>Danh sách transaction kèm thông tin khóa học liên quan.</returns>
    /// <response code="200">Lấy danh sách thành công.</response>
    /// <response code="401">Token không hợp lệ hoặc chưa đăng nhập.</response>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMyTransactions()
    {
        var userId = GetCurrentUserId(); // ✅ dùng helper từ BaseApiController
        if (userId is null)
            return Unauthorized(new ApiResponse<object>("Invalid token."));

        var result = await _transactionService.GetUserTransactionsAsync(userId.Value);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<List<TransactionResponseDto>>(result.Value!, "Transactions retrieved successfully."));
    }
}