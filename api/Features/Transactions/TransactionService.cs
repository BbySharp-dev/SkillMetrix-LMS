using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

public class TransactionService(ApplicationDbContext context) : ITransactionService
{
    public async Task<Result<PagedResponse<List<TransactionResponseDto>>>> GetUserTransactionsAsync(Guid userId, TransactionQueryDto query)
    {
        var baseQuery = context.Transactions
            .Include(t => t.Course)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking();

        var totalCount = await baseQuery.CountAsync();

        var transactions = await baseQuery
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var dto = transactions.Select(t => new TransactionResponseDto
        {
            Id = t.Id,
            UserId = t.UserId,
            EnrollmentId = t.EnrollmentId,
            CourseId = t.CourseId,
            CourseTitle = t.Course != null ? t.Course.Title : string.Empty,
            CourseThumbnail = t.Course?.Thumbnail,
            Amount = t.Amount,
            Type = t.Type,
            Status = t.Status,
            Description = t.Description,
            CreatedAt = t.CreatedAt
        }).ToList();

        return new PagedResponse<List<TransactionResponseDto>>(dto, query.PageNumber, query.PageSize, totalCount);
    }
}