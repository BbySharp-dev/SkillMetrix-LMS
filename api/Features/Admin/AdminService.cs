using Microsoft.AspNetCore.Identity;
using SkillMetrix_LMS.API.Features.Admin.DTOs;

namespace SkillMetrix_LMS.API.Features.Admin;

public class AdminService(
    ApplicationDbContext context,
    UserManager<User> userManager) : IAdminService
{
    public async Task<Result<PagedResponse<List<AdminUserListItemDto>>>> GetUsersAsync(AdminUserQueryDto query)
    {
        var usersQuery = context.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            usersQuery = usersQuery.Where(u =>
                (u.FullName ?? string.Empty).Contains(keyword, StringComparison.OrdinalIgnoreCase) ||
                (u.Email ?? string.Empty).Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        if (query.Role.HasValue)
            usersQuery = usersQuery.Where(u => u.Role == query.Role.Value);

        var totalCount = await usersQuery.CountAsync();

        var users = await usersQuery
            .OrderByDescending(u => u.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.Id,
                FullName = u.FullName ?? string.Empty,
                Email = u.Email ?? string.Empty,
                Role = u.Role,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PagedResponse<List<AdminUserListItemDto>>(
            users, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Result<bool>> UpdateUserRoleAsync(Guid userId, UserRole role, Guid actorId)
    {
        if (userId == actorId)
            return Result<bool>.ValidationError("You cannot change your own role");

        var user = await context.Users.FirstOrDefaultAsync(x => x.Id == userId);
        if (user == null)
            return Result<bool>.NotFound("User not found");

        user.Role = role;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<Result<AdminUserListItemDto>> CreateUserAsync(CreateUserDto dto, Guid actorId)
    {
        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
            return Result<AdminUserListItemDto>.Conflict("Email đã được sử dụng");

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            Role = dto.Role,
            CreatedAt = DateTime.UtcNow,
            EmailConfirmed = true,
        };

        var createResult = await userManager.CreateAsync(user, dto.Password);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            return Result<AdminUserListItemDto>.ValidationError(errors);
        }

        var addRoleResult = await userManager.AddToRoleAsync(user, dto.Role.ToString());
        if (!addRoleResult.Succeeded)
        {
            var errors = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
            return Result<AdminUserListItemDto>.ValidationError(errors);
        }

        return new AdminUserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Role = user.Role,
            CreatedAt = user.CreatedAt,
        };
    }

    public async Task<Result<bool>> DeleteUserAsync(Guid userId, Guid actorId)
    {
        if (userId == actorId)
            return Result<bool>.ValidationError("Không thể xóa tài khoản của chính bạn");

        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return Result<bool>.NotFound("Không tìm thấy người dùng");

        if (user.Role == UserRole.Admin)
            return Result<bool>.ValidationError("Không thể xóa tài khoản Admin");

        var hasEnrollments = await context.Enrollments.AnyAsync(e => e.UserId == userId);
        if (hasEnrollments)
            return Result<bool>.Conflict("Người dùng có khóa học đã đăng ký, không thể xóa");

        var deleteResult = await userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            var errors = string.Join(", ", deleteResult.Errors.Select(e => e.Description));
            return Result<bool>.ValidationError(errors);
        }

        return true;
    }

    public async Task<Result<PagedResponse<List<AdminCourseListItemDto>>>> GetCoursesAsync(AdminCourseQueryDto query)
    {
        var coursesQuery = context.Courses
            .AsNoTracking()
            .Include(c => c.Instructor)
            .Where(c => query.IncludeDeleted || !c.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var keyword = query.Search.Trim();
            coursesQuery = coursesQuery.Where(c => c.Title.Contains(keyword, StringComparison.OrdinalIgnoreCase));
        }

        if (query.Status.HasValue)
            coursesQuery = coursesQuery.Where(c => c.Status == query.Status.Value);

        var totalCount = await coursesQuery.CountAsync();

        var items = await coursesQuery
            .OrderByDescending(c => c.UpdatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(c => new
            {
                c.Id,
                c.Title,
                c.Description,
                c.Price,
                c.Thumbnail,
                InstructorName = c.Instructor.FullName,
                c.Status,
                c.CreatedAt,
                c.UpdatedAt,
                c.Rating,
                c.RejectionReason,
                c.IsDeleted,
                c.DeletedAt,
                EnrollmentCount = context.Enrollments.Count(e => e.CourseId == c.Id)
            })
            .ToListAsync();

        var result = items.Select(c => new AdminCourseListItemDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            Thumbnail = c.Thumbnail,
            InstructorName = c.InstructorName,
            EnrollmentCount = c.EnrollmentCount,
            Status = c.Status.ToString(),
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            Rating = c.Rating ?? 0,
            RejectionReason = c.RejectionReason,
            IsDeleted = c.IsDeleted,
            DeletedAt = c.DeletedAt
        }).ToList();

        return new PagedResponse<List<AdminCourseListItemDto>>(
            result, query.PageNumber, query.PageSize, totalCount);
    }

    public async Task<Result<bool>> ApproveCourseAsync(Guid courseId, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);
        if (course == null)
            return Result<bool>.NotFound("Course not found");

        if (course.Status != CourseStatus.Pending)
            return Result<bool>.ValidationError("Only pending course can be approved");

        course.Status = CourseStatus.Published;
        course.ApprovedBy = actorId;
        course.ApprovedAt = DateTime.UtcNow;
        course.RejectionReason = null;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<Result<bool>> RejectCourseAsync(Guid courseId, string reason, Guid actorId)
    {
        if (string.IsNullOrWhiteSpace(reason))
            return Result<bool>.ValidationError("Rejection reason is required");

        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);
        if (course == null)
            return Result<bool>.NotFound("Course not found");

        if (course.Status != CourseStatus.Pending)
            return Result<bool>.ValidationError("Only pending course can be rejected");

        course.Status = CourseStatus.Rejected;
        course.RejectionReason = reason.Trim();
        course.ApprovedBy = actorId;
        course.ApprovedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<Result<bool>> DeleteCourseAsync(Guid courseId, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);
        if (course == null)
            return Result<bool>.NotFound("Course not found or already deleted");

        course.IsDeleted = true;
        course.DeletedAt = DateTime.UtcNow;
        course.DeletedBy = actorId;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<Result<bool>> RestoreCourseAsync(Guid courseId, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == courseId && c.IsDeleted);
        if (course == null)
            return Result<bool>.NotFound("Course not found or not deleted");

        course.IsDeleted = false;
        course.DeletedAt = null;
        course.DeletedBy = null;

        await context.SaveChangesAsync();
        return true;
    }
}