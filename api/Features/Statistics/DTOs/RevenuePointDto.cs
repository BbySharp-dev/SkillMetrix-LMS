namespace SkillMetrix_LMS.API.Features.Statistics.DTOs;

public class RevenuePointDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}