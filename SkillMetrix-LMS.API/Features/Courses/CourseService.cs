using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Features.Courses.DTOs;


namespace SkillMetrix_LMS.API.Features.Courses;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CourseService> _logger;

    public CourseService(ApplicationDbContext context, ILogger<CourseService> logger)
    {
        _context = context;
        _logger = logger;
    }
    public async Task<Result<PagedResponse<List<CourseResponseDto>>>> GetCoursesAsync(int pageNumber, int pageSize)
    {
        var baseQuery = _context.Courses
            .Where(c => !c.IsDeleted)
            .Where(c => c.Status == CourseStatus.Published);

        var totalRecords = await baseQuery.CountAsync();

        var courses = await baseQuery
            .Include(c => c.Instructor)
            .OrderByDescending(c => c.CreatedAt)
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

    public async Task<Result<CourseResponseDto>> GetCourseByIdAsync(Guid id)
    {
        var course = await _context.Courses
            .Where(c => !c.IsDeleted)
            .Where(c => c.Status == CourseStatus.Published)
            .Include(c => c.Instructor)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null)
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
            .FirstOrDefaultAsync(u => u.Id == dto.InstructorId && u.Role == UserRole.Instructor);

        if (instructor == null)
        {
            return Result<CourseResponseDto>.NotFound("Instructor not found or user is not an instructor");
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
                .FirstOrDefaultAsync(u => u.Id == dto.InstructorId.Value && u.Role == UserRole.Instructor);

            if (newInstructor == null)
            {
                return Result<CourseResponseDto>.NotFound("Instructor not found or user is not an instructor");
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
}
