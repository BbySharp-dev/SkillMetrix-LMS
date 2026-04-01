using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Features.Transactions.DTOs;
using SkillMetrix_LMS.API.Infrastructure.Persistence;

namespace SkillMetrix_LMS.API.Features.Transactions;

public class TransactionService : ITransactionService
{
    private readonly ApplicationDbContext _context;
    public TransactionService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<TransactionResponseDto>>> GetUserTransactionsAsync(Guid userId)
    {
        var transactions = await _context.Transactions
            .Include(t => t.Course)
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
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

        return dto;
    }
}