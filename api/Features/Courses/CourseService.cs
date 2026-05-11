using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Models.Enums;
using SkillMetrix_LMS.API.Shared.Common;
using SkillMetrix_LMS.API.Features.Courses.DTOs;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Courses;

public class CourseService(ApplicationDbContext context) : ICourseService
{
    public async Task<Result<PagedResponse<List<CourseResponseDto>>>> GetCoursesAsync(int pageNumber, int pageSize, CourseQueryDto query)
    {
        var baseQuery = context.Courses
            .Include(c => c.Instructor)
            .Where(c => !c.IsDeleted);

        // 1. Lọc theo trạng thái (Status)
        if (!string.IsNullOrWhiteSpace(query.Status) && query.Status != "All")
        {
            if (Enum.TryParse<CourseStatus>(query.Status, true, out var status))
            {
                baseQuery = baseQuery.Where(c => c.Status == status);
            }
        }
        else if (!query.InstructorId.HasValue)
        {
            // Mặc định chỉ hiện Published cho catalog công khai
            baseQuery = baseQuery.Where(c => c.Status == CourseStatus.Published);
        }

        // 2. Lọc theo InstructorId
        if (query.InstructorId.HasValue)
        {
            Console.WriteLine($"[CourseService.GetCoursesAsync] Filtering by InstructorId={query.InstructorId.Value}");
            baseQuery = baseQuery.Where(c => c.InstructorId == query.InstructorId.Value);
        }
        else
        {
            Console.WriteLine("[CourseService.GetCoursesAsync] WARNING: InstructorId is null - returning ALL courses!");
        }

        // 3. Search title
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            baseQuery = baseQuery.Where(c => c.Title.Contains(query.Search));
        }

        if (query.MinPrice.HasValue)
        {
            baseQuery = baseQuery.Where(c => c.Price >= query.MinPrice);
        }

        if (query.MaxPrice.HasValue)
        {
            baseQuery = baseQuery.Where(c => c.Price <= query.MaxPrice);
        }

        var totalRecords = await baseQuery.CountAsync();

        baseQuery = query.SortBy?.ToLower() switch
        {
            "price" => baseQuery.OrderBy(c => c.Price),
            "rating" => baseQuery.OrderByDescending(c => c.Rating),
            _ => baseQuery.OrderByDescending(c => c.CreatedAt)
        };

        var courses = await baseQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var courseIds = courses.Select(c => c.Id).ToList();

        var chapterCounts = await context.Chapters
            .Where(ch => courseIds.Contains(ch.CourseId) && !ch.IsDeleted)
            .GroupBy(ch => ch.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        var enrollmentCounts = await context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .GroupBy(e => e.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        var courseDtos = courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            Thumbnail = c.Thumbnail,
            InstructorName = c.Instructor?.FullName ?? "Unknown",
            ChapterCount = chapterCounts.GetValueOrDefault(c.Id, 0),
            EnrollmentCount = enrollmentCounts.GetValueOrDefault(c.Id, 0),
            Status = c.Status.ToString(),
            CreatedAt = c.CreatedAt,
            Rating = c.Rating ?? 0
        }).ToList();

        return new PagedResponse<List<CourseResponseDto>>(
            courseDtos,
            pageNumber,
            pageSize,
            totalRecords,
            "Courses retrieved successfully"
        );
    }

    public async Task<Result<CourseResponseDto>> GetCourseByIdAsync(Guid id, Guid? currentUserId = null, string? currentUserRole = null)
    {
        var course = await context.Courses
            .Where(c => !c.IsDeleted)
            .Include(c => c.Instructor)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return Result<CourseResponseDto>.NotFound("Course not found");

        bool isPublished = course.Status == CourseStatus.Published;
        bool isAdmin = currentUserRole == "Admin";
        bool isOwner = currentUserId.HasValue && course.InstructorId == currentUserId.Value;

        if (!isPublished && !isAdmin && !isOwner) return Result<CourseResponseDto>.NotFound("Course not found");

        var chapterCount = await context.Chapters.CountAsync(ch => ch.CourseId == id && !ch.IsDeleted);
        var enrollmentCount = await context.Enrollments.CountAsync(e => e.CourseId == id);

        return new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = course.Instructor?.FullName ?? "Unknown",
            ChapterCount = chapterCount,
            EnrollmentCount = enrollmentCount,
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt,
            Rating = course.Rating ?? 0
        };
    }

    public async Task<Result<CourseDetailResponseDto>> GetCourseDetailAsync(Guid id)
    {
        var course = await context.Courses
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (course == null) return Result<CourseDetailResponseDto>.NotFound("Course not found");

        var chapters = await context.Chapters
            .Where(ch => ch.CourseId == id && !ch.IsDeleted)
            .OrderBy(ch => ch.OrderIndex)
            .Include(ch => ch.Lessons)
            .ToListAsync();

        return new CourseDetailResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = course.Instructor?.FullName ?? "Unknown",
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt,
            Rating = course.Rating ?? 0,
            Curriculum = chapters.Select(ch => new ChapterWithLessonsDto
            {
                Id = ch.Id,
                Title = ch.Title,
                OrderIndex = ch.OrderIndex,
                Lessons = ch.Lessons
                    .Where(l => !l.IsDeleted)
                    .OrderBy(l => l.OrderIndex)
                    .Select(l => new LessonResponseDto
                    {
                        Id = l.Id,
                        Title = l.Title,
                        VideoUrl = l.VideoUrl,
                        DurationSeconds = l.DurationSeconds,
                        IsFreePreview = l.IsFreePreview,
                        OrderIndex = l.OrderIndex
                    }).ToList()
            }).ToList()
        };
    }

    public async Task<Result<CourseResponseDto>> CreateCourseAsync(CreateCourseDto dto)
    {
        var instructor = await context.Users.FirstOrDefaultAsync(u => u.Id == dto.InstructorId);
        if (instructor == null) return Result<CourseResponseDto>.NotFound("Instructor not found");

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            Thumbnail = dto.Thumbnail,
            InstructorId = dto.InstructorId,
            Status = CourseStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        context.Courses.Add(course);
        await context.SaveChangesAsync();

        return new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = instructor.FullName,
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt
        };
    }

    public async Task<Result<CourseResponseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null) return Result<CourseResponseDto>.NotFound("Course not found");
        if (course.InstructorId != actorId)
            return Result<CourseResponseDto>.Failure("You can only update your own courses", ErrorType.Forbidden);

        course.Title = dto.Title ?? course.Title;
        course.Description = dto.Description ?? course.Description;
        course.Price = dto.Price ?? course.Price;
        course.Thumbnail = dto.Thumbnail ?? course.Thumbnail;
        course.UpdatedAt = DateTime.UtcNow;
        course.UpdatedBy = actorId;

        await context.SaveChangesAsync();
        return await GetCourseByIdAsync(id);
    }

    public async Task<Result> DeleteCourseAsync(Guid id, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null) return Result.Failure("Course not found");
        if (course.InstructorId != actorId)
            return Result.Failure("You can only delete your own courses", ErrorType.Forbidden);

        course.IsDeleted = true;
        course.DeletedAt = DateTime.UtcNow;
        course.DeletedBy = actorId;
        await context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> SubmitCourseAsync(Guid id, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null) return Result.Failure("Course not found");

        course.Status = CourseStatus.Pending;
        await context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> ApproveCourseAsync(Guid id, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null) return Result.Failure("Course not found");

        course.Status = CourseStatus.Published;
        course.PublishedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> RejectCourseAsync(Guid id, Guid actorId, string reason)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null) return Result.Failure("Course not found");

        course.Status = CourseStatus.Rejected;
        await context.SaveChangesAsync();
        return Result.Success();
    }
}
