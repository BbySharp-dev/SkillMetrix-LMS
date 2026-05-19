using SkillMetrix_LMS.API.Features.Admin.DTOs;

namespace SkillMetrix_LMS.API.Features.Admin;

public interface IAdminService
{
    Task<Result<PagedResponse<List<AdminUserListItemDto>>>> GetUsersAsync(AdminUserQueryDto query);
    Task<Result<bool>> UpdateUserRoleAsync(Guid userId, UserRole role, Guid actorId);
    Task<Result<AdminUserListItemDto>> CreateUserAsync(CreateUserDto dto, Guid actorId);
    Task<Result<bool>> DeleteUserAsync(Guid userId, Guid actorId);

    Task<Result<PagedResponse<List<AdminCourseListItemDto>>>> GetCoursesAsync(AdminCourseQueryDto query);
    Task<Result<bool>> ApproveCourseAsync(Guid courseId, Guid actorId);
    Task<Result<bool>> RejectCourseAsync(Guid courseId, string reason, Guid actorId);
    Task<Result<bool>> DeleteCourseAsync(Guid courseId, Guid actorId);
    Task<Result<bool>> RestoreCourseAsync(Guid courseId, Guid actorId);
}
