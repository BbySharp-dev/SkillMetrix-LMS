using SkillMetrix_LMS.API.Features.Transactions.DTOs;

namespace SkillMetrix_LMS.API.Features.Transactions;

public class TransactionService(ApplicationDbContext context) : ITransactionService
{
    public async Task<Result<PagedResponse<List<TransactionResponseDto>>>> GetUserTransactionsAsync(Guid userId, TransactionQueryDto query)
    {
        var baseQuery = context.Transactions
            .Include(t => t.Course)
            .Where(t => t.UserId == userId)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            baseQuery = baseQuery.Where(t =>
                (t.Course != null && t.Course.Title.Contains(keyword)) ||
                (t.Description != null && t.Description.Contains(keyword)));
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<TransactionStatus>(query.Status, true, out var status))
        {
            baseQuery = baseQuery.Where(t => t.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Type) && Enum.TryParse<TransactionType>(query.Type, true, out var type))
        {
            baseQuery = baseQuery.Where(t => t.Type == type);
        }

        var totalCount = await baseQuery.CountAsync();

        baseQuery = query.SortBy?.ToLower() switch
        {
            "amount" => baseQuery.OrderByDescending(t => t.Amount),
            "oldest" => baseQuery.OrderBy(t => t.CreatedAt),
            _ => baseQuery.OrderByDescending(t => t.CreatedAt)
        };

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