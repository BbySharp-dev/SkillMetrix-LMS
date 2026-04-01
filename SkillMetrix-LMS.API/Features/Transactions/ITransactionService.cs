using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

public interface ITransactionService
{
    Task<Result<List<TransactionResponseDto>>> GetUserTransactionsAsync(Guid userId);
}