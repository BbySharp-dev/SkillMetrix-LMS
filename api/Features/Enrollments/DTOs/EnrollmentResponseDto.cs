namespace SkillMetrix_LMS.API.Features.Courses.DTOs;

public class EnrollmentResponseDto
{
    public Guid Id {get; set;}
    public Guid UserId {get; set;}
    public Guid CourseId {get; set;}
    public string CourseTitle {get; set;} = string.Empty;
    public string? CourseThumbnail {get; set;}
    public decimal PricePaid {get; set;}
    public DateTime EnrolledAt {get; set;}
}