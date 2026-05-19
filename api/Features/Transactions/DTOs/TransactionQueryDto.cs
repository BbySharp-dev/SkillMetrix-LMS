namespace SkillMetrix_LMS.API.Features.Transactions.DTOs;

public class TransactionQueryDto
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
