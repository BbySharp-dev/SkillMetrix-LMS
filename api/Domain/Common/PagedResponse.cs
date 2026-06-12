namespace SkillMetrix_LMS.API.Domain.Common;

public class PagedResponse<T>(T data, int pageNumber, int pageSize, int totalRecords)
{
    public T Data { get; set; } = data;
    public int PageNumber { get; set; } = pageNumber;
    public int PageSize { get; set; } = pageSize;
    public int TotalRecords { get; set; } = totalRecords;
    public int TotalPages { get; set; } = (int)Math.Ceiling(totalRecords / (double)pageSize);
}