using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Features.Certificates.DTOs;
using SkillMetrix_LMS.API.Infrastructure.Persistence;
using SkillMetrix_LMS.API.Shared.Common;

namespace SkillMetrix_LMS.API.Features.Certificates;

public class CertificateService(ApplicationDbContext context) : ICertificateService
{
    public async Task<Result<List<CertificateDto>>> GetUserCertificatesAsync(Guid userId)
    {
        var certs = await context.Certificates
            .Where(c => c.UserId == userId)
            .Include(c => c.Course).ThenInclude(c => c.Instructor)
            .Include(c => c.User)
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto
            {
                Id = c.Id,
                UserId = c.UserId,
                CourseId = c.CourseId,
                CourseTitle = c.Course.Title,
                CourseThumbnail = c.Course.Thumbnail,
                InstructorName = c.Course.Instructor.FullName,
                CertificateCode = c.CertificateCode,
                PdfUrl = c.PdfUrl,
                IssuedAt = c.IssuedAt
            })
            .ToListAsync();

        return certs;
    }

    public async Task<Result<CertificateDto>> GetCertificateByIdAsync(Guid userId, Guid certificateId)
    {
        var cert = await context.Certificates
            .Where(c => c.Id == certificateId && c.UserId == userId)
            .Include(c => c.Course).ThenInclude(c => c.Instructor)
            .FirstOrDefaultAsync();

        if (cert == null)
            return Result<CertificateDto>.NotFound("Certificate not found");

        return MapToDto(cert);
    }

    public async Task<Result<CertificateDto>> GetCertificateByCourseAsync(Guid userId, Guid courseId)
    {
        var cert = await context.Certificates
            .Where(c => c.UserId == userId && c.CourseId == courseId)
            .Include(c => c.Course).ThenInclude(c => c.Instructor)
            .FirstOrDefaultAsync();

        if (cert == null)
            return Result<CertificateDto>.NotFound("No certificate found for this course");

        return MapToDto(cert);
    }

    public async Task<Result<CertificateDto>> IssueCertificateAsync(Guid userId, Guid courseId)
    {
        var existing = await context.Certificates
            .AnyAsync(c => c.UserId == userId && c.CourseId == courseId);
        if (existing)
            return Result<CertificateDto>.Conflict("Certificate already issued for this course");

        var isEnrolled = await context.Enrollments
            .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);
        if (!isEnrolled)
            return Result<CertificateDto>.Forbidden("You are not enrolled in this course");

        var totalLessons = await context.Chapters
            .Where(ch => ch.CourseId == courseId && !ch.IsDeleted)
            .SelectMany(ch => ch.Lessons.Where(l => !l.IsDeleted))
            .CountAsync();

        var completedLessons = await context.UserLessonProgresses
            .Where(p => p.UserId == userId && p.IsCompleted && !p.Lesson.IsDeleted && p.Lesson.Chapter.CourseId == courseId)
            .CountAsync();

        if (completedLessons < totalLessons || totalLessons == 0)
            return Result<CertificateDto>.BusinessRule("Course must be completed before issuing a certificate");

        var course = await context.Courses
            .Include(c => c.Instructor)
            .FirstAsync(c => c.Id == courseId);

        var cert = new Certificate
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CourseId = courseId,
            CertificateCode = $"CERT-{courseId.ToString()[..4].ToUpper()}-{userId.ToString()[..4].ToUpper()}-{DateTime.UtcNow:yyyyMMdd}",
            PdfUrl = string.Empty,
            IssuedAt = DateTime.UtcNow
        };

        context.Certificates.Add(cert);
        await context.SaveChangesAsync();

        cert.Course = course;
        return MapToDto(cert);
    }

    private static CertificateDto MapToDto(Certificate cert) => new()
    {
        Id = cert.Id,
        UserId = cert.UserId,
        CourseId = cert.CourseId,
        CourseTitle = cert.Course.Title,
        CourseThumbnail = cert.Course.Thumbnail,
        InstructorName = cert.Course.Instructor.FullName,
        CertificateCode = cert.CertificateCode,
        PdfUrl = cert.PdfUrl,
        IssuedAt = cert.IssuedAt
    };
}
