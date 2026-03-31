using SkillMetrix_LMS.API.Features.Courses.DTOs;
using SkillMetrix_LMS.API.Features.Chapters;
using SkillMetrix_LMS.API.DTOs.Responses;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace SkillMetrix_LMS.API.Features.Courses;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CourseService> _logger;
    private readonly IChapterService _chapterService;

    public CourseService(ApplicationDbContext context, ILogger<CourseService> logger, IChapterService chapterService)
    {
        _context = context;
        _logger = logger;
        _chapterService = chapterService;
    }
    public async Task<Result<PagedResponse<List<CourseResponseDto>>>> GetCoursesAsync(int pageNumber, int pageSize, CourseQueryDto query)
    {
        var baseQuery = _context.Courses
            .Include(c => c.Instructor)
            .Where(c => !c.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            if (Enum.TryParse<CourseStatus>(query.Status, true, out var status))
            {
                baseQuery = baseQuery.Where(c => c.Status == status);
            }
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            baseQuery = baseQuery.Where(c => c.Title.Contains(query.Search));
        }

        if (query.InstructorId.HasValue)
        {
            baseQuery = baseQuery.Where(c => c.InstructorId == query.InstructorId);
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

        baseQuery = query.SortBy switch
        {
            "price" => baseQuery.OrderBy(c => c.Price),
            "rating" => baseQuery.OrderByDescending(c => c.Rating),
            _ => baseQuery.OrderByDescending(c => c.CreatedAt)
        };

        var courses = await baseQuery
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();
            
        var courseIds = courses.Select(c => c.Id).ToList();

        var chapterCounts = await _context.Chapters
            .Where(ch => courseIds.Contains(ch.CourseId) && !ch.IsDeleted)
            .GroupBy(ch => ch.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        var enrollmentCounts = await _context.Enrollments
            .Where(e => courseIds.Contains(e.CourseId))
            .GroupBy(e => e.CourseId)
            .Select(g => new { CourseId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.CourseId, x => x.Count);

        // Map Entity -> DTO (Nên dùng Mapster để code gọn hơn)
        var courseDtos = courses.Select(c => new CourseResponseDto
        {
            Id = c.Id,
            Title = c.Title,
            Description = c.Description,
            Price = c.Price,
            Thumbnail = c.Thumbnail,
            InstructorName = c.Instructor.FullName,
            ChapterCount = chapterCounts.GetValueOrDefault(c.Id, 0),  // Lấy từ dictionary
            EnrollmentCount = enrollmentCounts.GetValueOrDefault(c.Id, 0),  // Lấy từ dictionary
            Status = c.Status.ToString(),
            CreatedAt = c.CreatedAt
        }).ToList();

        var pagedResponse = new PagedResponse<List<CourseResponseDto>>(
            courseDtos,
            pageNumber,
            pageSize,
            totalRecords,
            "Courses retrieved successfully"
        );

        // Dùng implicit operator: return trực tiếp DTO
        return pagedResponse;

    }

    public async Task<Result<CourseResponseDto>> GetCourseByIdAsync(Guid id, Guid? currentUserId = null, string? currentUserRole = null)
    {
        var course = await _context.Courses
            .Where(c => !c.IsDeleted)
            .Include(c => c.Instructor)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
        {
            return Result<CourseResponseDto>.NotFound($"Course with ID {id} not found");
        }

        bool isPublished = course.Status == CourseStatus.Published;
        bool isAdmin = currentUserRole == UserRole.Admin.ToString();
        bool isOwnerInstructor = currentUserId.HasValue && course.InstructorId == currentUserId.Value;

        if (!isPublished && !isAdmin && !isOwnerInstructor)
        {
            return Result<CourseResponseDto>.NotFound($"Course with ID {id} not found");
        }

        var chapterCount = await _context.Chapters
            .CountAsync(ch => ch.CourseId == id && !ch.IsDeleted);

        var enrollmentCount = await _context.Enrollments
            .CountAsync(e => e.CourseId == id);
        var courseDto = new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = course.Instructor.FullName,
            ChapterCount = chapterCount,  // Lấy từ CountAsync riêng
            EnrollmentCount = enrollmentCount,  // Lấy từ CountAsync riêng
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt
        };

        return courseDto;
    }

    public async Task<Result<CourseResponseDto>> CreateCourseAsync(CreateCourseDto dto)
    {
        var instructor = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == dto.InstructorId
                && (u.Role == UserRole.Instructor || u.Role == UserRole.Admin));

        if (instructor == null)
        {
            return Result<CourseResponseDto>.NotFound("Instructor not found or user is not an instructor/admin");
        }

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

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        var courseDto = new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = instructor.FullName,
            ChapterCount = 0,
            EnrollmentCount = 0,
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt
        };

        return courseDto;

    }

    public async Task<Result<CourseResponseDto>> UpdateCourseAsync(Guid id, UpdateCourseDto dto)
    {
        var course = await _context.Courses
            .Where(c => !c.IsDeleted)
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
        {
            return Result<CourseResponseDto>.NotFound($"Course with ID {id} not found");
        }

        if (course.Status == CourseStatus.Published && dto.Price.HasValue && dto.Price.Value != course.Price)
        {
            return Result<CourseResponseDto>.Failure("Cannot change price for a published course", ErrorType.BusinessRule);
        }

        if (dto.InstructorId.HasValue && dto.InstructorId.Value != course.InstructorId)
        {
            var newInstructor = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == dto.InstructorId.Value
                    && (u.Role == UserRole.Instructor || u.Role == UserRole.Admin));

            if (newInstructor == null)
            {
                return Result<CourseResponseDto>.NotFound("Instructor not found or user is not an instructor/admin");
            }

            course.InstructorId = newInstructor.Id;
            course.Instructor = newInstructor;
        }

        if (dto.Title != null)
        {
            course.Title = dto.Title;
        }

        if (dto.Description != null)
        {
            course.Description = dto.Description;
        }

        if (dto.Price.HasValue)
        {
            course.Price = dto.Price.Value;
        }

        if (dto.Thumbnail != null)
        {
            course.Thumbnail = dto.Thumbnail;
        }

        course.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var chapterCountTask = _context.Chapters
            .CountAsync(ch => ch.CourseId == id && !ch.IsDeleted);

        var enrollmentCountTask = _context.Enrollments
            .CountAsync(e => e.CourseId == id);

        await Task.WhenAll(chapterCountTask, enrollmentCountTask);

        var courseDto = new CourseResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = course.Instructor.FullName,
            ChapterCount = chapterCountTask.Result,
            EnrollmentCount = enrollmentCountTask.Result,
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt
        };

        return courseDto;
    }

    public async Task<Result> DeleteCourseAsync(Guid id)
    {
        var course = await _context.Courses
            .Where(c => !c.IsDeleted)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
        {
            return Result.NotFound($"Course with ID {id} not found");
        }

        var hasEnrollments = await _context.Enrollments
            .AnyAsync(e => e.CourseId == id);

        if (hasEnrollments)
        {
            return Result.Failure("Cannot delete course with existing enrollments", ErrorType.Conflict);
        }


        course.IsDeleted = true;
        course.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result<CourseDetailResponseDto>> GetCourseDetailAsync(Guid id)
    {
        var course = await _context.Courses
            .Include(c => c.Instructor)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (course == null)
        {
            return Result<CourseDetailResponseDto>.NotFound("Course not found");
        }

        var curriculumnResult = await _chapterService.GetCurriculumAsync(id);
        var curriculumn = curriculumnResult.IsSuccess
            ? curriculumnResult.Value!
            : new List<ChapterWithLessonsDto>();

        return new CourseDetailResponseDto
        {
            Id = course.Id,
            Title = course.Title,
            Description = course.Description,
            Price = course.Price,
            Thumbnail = course.Thumbnail,
            InstructorName = course.Instructor.FullName,
            Status = course.Status.ToString(),
            CreatedAt = course.CreatedAt,
            PublishedAt = course.PublishedAt,
            Curriculum = curriculumn
        };
    }

    public async Task<Result> SubmitCourseAsync(Guid id, Guid actorId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        if (course.InstructorId != actorId)
        {
            return Result.Forbidden("You are allowed to sunmit this course");
        }

        course.Status = CourseStatus.Pending;
        course.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> ApproveCourseAsync(Guid id, Guid actorId)
    {
        var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
        if (actor?.Role != UserRole.Moderator && actor?.Role != UserRole.Admin)
        {
            return Result.Forbidden("Only Moderator/Admin can approve courses");
        }

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        course.Status = CourseStatus.Published;
        course.PublishedAt = DateTime.UtcNow;
        course.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }

    public async Task<Result> RejectCourseAsync(Guid id, Guid actorId, string reason)
    {
        var actor = await _context.Users.FirstOrDefaultAsync(u => u.Id == actorId);
        if (actor?.Role != UserRole.Moderator && actor?.Role != UserRole.Admin)
        {
            return Result.Forbidden("Only Moderator/Admin can reject courses");
        }

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        if (course == null)
        {
            return Result.NotFound("Course not found");
        }

        course.Status = CourseStatus.Rejected;
        course.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Result.Success();
    }
}
