namespace SkillMetrix_LMS.API.Features.Admin.DTOs;

public class AdminOverviewDto
{
    public int TotalUsers { get; set; }
    public int TotalCourses { get; set; }
    public int TotalEnrollments { get; set; }
    public decimal TotalRevenue { get; set; }
    public int TotalStudents { get; set; }
    public int TotalInstructors { get; set; }
    public int TotalModerators { get; set; }
    public int TotalAdmins { get; set; }
    public int DraftCourses { get; set; }
    public int PendingCourses { get; set; }
    public int PublishedCourses { get; set; }
    public int RejectedCourses { get; set; }
}