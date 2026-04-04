namespace SkillMetrix_LMS.API.Models;

public class QuizQuestion
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string Content { get; set; } = string.Empty;
    public decimal Point { get; set; } = 1;
    public int OrderIndex { get; set; }

    public Quiz Quiz { get; set; } = null!;
    public ICollection<QuizOption> Options { get; set; } = new List<QuizOption>();
}
