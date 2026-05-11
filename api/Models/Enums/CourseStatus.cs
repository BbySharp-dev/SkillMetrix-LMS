namespace SkillMetrix_LMS.API.Models.Enums;

public enum CourseStatus
{
    Draft = 1,
    Pending = 2,
    PendingApproval = 2, // alias cho Pending
    Published = 3,
    Rejected = 4
}
