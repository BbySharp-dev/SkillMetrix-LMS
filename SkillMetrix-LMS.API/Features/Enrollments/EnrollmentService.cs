using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Features.Courses.DTOs;
using SkillMetrix_LMS.API.Infrastructure.Persistence;

namespace SkillMetrix_LMS.API.Features.Courses;

public class EnrollmentService : IEnrollmentService
{
    private readonly ApplicationDbContext _context;

    public EnrollmentService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<Result<EnrollmentResponseDto>> EnrollAsync(Guid userId, CreateEnrollmentDto dto)
    {
        var course = await _context.Courses
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == dto.CourseId && !c.IsDeleted);

        if (course == null)
        {
            return Result<EnrollmentResponseDto>.NotFound("Course not found");
        }

        if (course.Status != CourseStatus.Published)
        {
            return Result<EnrollmentResponseDto>.BusinessRule("Course is not published");
        }

        var exists = await _context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == dto.CourseId);

        if (exists)
        {
            return Result<EnrollmentResponseDto>.BusinessRule("Alreadly enrolled");
        }

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = dto.CourseId,
            PricePaid = course.Price,
            EnrolledAt = DateTime.UtcNow
        };

        _context.Enrollments.Add(enrollment);

        if (course.Price > 0)
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                EnrollmentId = enrollment.Id,
                CourseId = course.Id,
                Amount = course.Price,
                Type = TransactionType.Purchase,
                Status = TransactionStatus.Completed,
                Description = "Thanh toán cho khóa học",
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
        }

        await _context.SaveChangesAsync();

        return new EnrollmentResponseDto
        {
            Id = enrollment.Id,
            UserId = enrollment.UserId,
            CourseId = enrollment.CourseId,
            PricePaid = enrollment.PricePaid,
            EnrolledAt = enrollment.EnrolledAt
        };
    }

    public async Task<Result<List<EnrollmentResponseDto>>> GetUserEnrollmentsAsync(Guid userId)
    {
        var enrollments = await _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .AsNoTracking()
            .ToListAsync();

        var dto = enrollments.Select(e => new EnrollmentResponseDto
        {
            Id = e.Id,
            UserId = e.UserId,
            CourseId = e.CourseId,
            CourseTitle = e.Course.Title,
            CourseThumbnail = e.Course.Thumbnail,
            PricePaid = e.PricePaid,
            EnrolledAt = e.EnrolledAt
        }).ToList();

        return dto;
    }
}