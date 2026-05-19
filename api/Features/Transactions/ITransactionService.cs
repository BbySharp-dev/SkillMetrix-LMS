using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

public interface ITransactionService
{
    Task<Result<PagedResponse<List<TransactionResponseDto>>>> GetUserTransactionsAsync(Guid userId, TransactionQueryDto query);
}