using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillMetrix_LMS.API.Infrastructure.Persistence;

namespace SkillMetrix_LMS.API.Features.Seed;

public class DataSeederService
{
    public const string DefaultPassword = "Password@123";

    private readonly ApplicationDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IWebHostEnvironment _environment;

    public DataSeederService(
        ApplicationDbContext context,
        UserManager<User> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IWebHostEnvironment environment)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _environment = environment;
    }

    public async Task<Result<SeedSummaryDto>> ResetAndSeedStrictAsync()
    {
        if (!_environment.IsDevelopment())
            return Result<SeedSummaryDto>.Forbidden("Seed API is allowed only in Development mode.");

        await ResetAllDataInternalAsync();
        await EnsureRolesAsync();

        var users = await SeedUsersAsync();
        var summary = await SeedLearningDataStrictAsync(users);

        summary.DefaultPassword = DefaultPassword;
        summary.Credentials = users
            .OrderBy(x => x.Role)
            .ThenBy(x => x.Email)
            .Select(x => new SeedCredentialDto
            {
                Role = x.Role.ToString(),
                Email = x.Email!,
                FullName = x.FullName,
                Password = DefaultPassword
            })
            .ToList();

        return summary;
    }

    public async Task<Result> ResetAllDataAsync()
    {
        if (!_environment.IsDevelopment())
            return Result.Forbidden("Seed API is allowed only in Development mode.");

        await ResetAllDataInternalAsync();
        return Result.Success();
    }

    private async Task ResetAllDataInternalAsync()
    {
        _context.UserLessonProgresses.RemoveRange(_context.UserLessonProgresses);
        _context.Transactions.RemoveRange(_context.Transactions);
        _context.Enrollments.RemoveRange(_context.Enrollments);
        _context.RefreshTokens.RemoveRange(_context.RefreshTokens);
        _context.Lessons.RemoveRange(_context.Lessons);
        _context.Chapters.RemoveRange(_context.Chapters);
        _context.Courses.RemoveRange(_context.Courses);

        _context.UserTokens.RemoveRange(_context.UserTokens);
        _context.UserLogins.RemoveRange(_context.UserLogins);
        _context.UserClaims.RemoveRange(_context.UserClaims);
        _context.UserRoles.RemoveRange(_context.UserRoles);
        _context.RoleClaims.RemoveRange(_context.RoleClaims);
        _context.Roles.RemoveRange(_context.Roles);
        _context.Users.RemoveRange(_context.Users);

        await _context.SaveChangesAsync();
    }

    private async Task EnsureRolesAsync()
    {
        var roleNames = new[]
        {
            UserRole.Admin.ToString(),
            UserRole.Moderator.ToString(),
            UserRole.Instructor.ToString(),
            UserRole.Student.ToString()
        };

        foreach (var roleName in roleNames)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
                continue;

            var createRoleResult = await _roleManager.CreateAsync(new IdentityRole<Guid>
            {
                Id = Guid.NewGuid(),
                Name = roleName,
                NormalizedName = roleName.ToUpperInvariant()
            });

            if (!createRoleResult.Succeeded)
            {
                var errors = string.Join(", ", createRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Create role '{roleName}' failed: {errors}");
            }
        }
    }

    private async Task<List<User>> SeedUsersAsync()
    {
        var users = new List<User>
        {
            CreateUser("admin@skillmetrix.dev", "System Admin", UserRole.Admin),
            CreateUser("moderator1@skillmetrix.dev", "Moderator One", UserRole.Moderator),
            CreateUser("moderator2@skillmetrix.dev", "Moderator Two", UserRole.Moderator),
            CreateUser("instructor1@skillmetrix.dev", "Instructor One", UserRole.Instructor),
            CreateUser("instructor2@skillmetrix.dev", "Instructor Two", UserRole.Instructor),
            CreateUser("instructor3@skillmetrix.dev", "Instructor Three", UserRole.Instructor),
            CreateUser("instructor4@skillmetrix.dev", "Instructor Four", UserRole.Instructor),
            CreateUser("instructor5@skillmetrix.dev", "Instructor Five", UserRole.Instructor),
            CreateUser("instructor6@skillmetrix.dev", "Instructor Six", UserRole.Instructor)
        };

        for (var i = 1; i <= 18; i++)
        {
            users.Add(CreateUser($"student{i}@skillmetrix.dev", $"Student {i:00}", UserRole.Student));
        }

        foreach (var user in users)
        {
            var createResult = await _userManager.CreateAsync(user, DefaultPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Create user '{user.Email}' failed: {errors}");
            }

            var addRoleResult = await _userManager.AddToRoleAsync(user, user.Role.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errors = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Assign role for '{user.Email}' failed: {errors}");
            }
        }

        return users;
    }

    private async Task<SeedSummaryDto> SeedLearningDataStrictAsync(List<User> users)
    {
        var rng = new Random(20260402);
        var now = DateTime.UtcNow;

        var instructors = users.Where(x => x.Role == UserRole.Instructor).ToList();
        var students = users.Where(x => x.Role == UserRole.Student).ToList();

        var courses = new List<Course>();
        var chapters = new List<Chapter>();
        var lessons = new List<Lesson>();
        var enrollments = new List<Enrollment>();
        var transactions = new List<Transaction>();
        var progresses = new List<UserLessonProgress>();

        var lessonsByCourse = new Dictionary<Guid, List<Lesson>>();

        foreach (var (instructor, instructorIndex) in instructors.Select((value, index) => (value, index)))
        {
            var statuses = new[] { CourseStatus.Published, CourseStatus.Pending, CourseStatus.Draft };

            for (var courseSlot = 0; courseSlot < statuses.Length; courseSlot++)
            {
                var status = statuses[courseSlot];
                var createdAt = now.AddDays(-60 + instructorIndex * 5 + courseSlot * 2);

                var course = new Course
                {
                    Id = Guid.NewGuid(),
                    Title = $"{instructor.FullName} Course {courseSlot + 1}",
                    Description = $"Strict seed course {courseSlot + 1} by {instructor.FullName}",
                    InstructorId = instructor.Id,
                    Status = status,
                    Price = 199000 + instructorIndex * 25000 + courseSlot * 15000,
                    Thumbnail = $"https://picsum.photos/seed/{instructorIndex + 1}-{courseSlot + 1}/640/360",
                    CreatedAt = createdAt,
                    PublishedAt = status == CourseStatus.Published ? createdAt.AddDays(2) : null,
                    UpdatedAt = createdAt.AddDays(1),
                    Rating = status == CourseStatus.Published ? Math.Round((decimal)(3.8 + rng.NextDouble()), 2) : null,
                    IsDeleted = false
                };

                courses.Add(course);

                var chapterCount = 3 + (courseSlot % 2); // 3 or 4
                var lessonCounter = 0;
                var lessonsForCourse = new List<Lesson>();

                for (var chapterIndex = 1; chapterIndex <= chapterCount; chapterIndex++)
                {
                    var chapterCreatedAt = createdAt.AddHours(chapterIndex);

                    var chapter = new Chapter
                    {
                        Id = Guid.NewGuid(),
                        CourseId = course.Id,
                        Title = $"Chapter {chapterIndex}",
                        Description = $"Chapter {chapterIndex} for {course.Title}",
                        OrderIndex = chapterIndex,
                        CreatedAt = chapterCreatedAt,
                        UpdatedAt = chapterCreatedAt
                    };

                    chapters.Add(chapter);

                    var lessonCount = 4 + (chapterIndex % 2); // 4 or 5
                    for (var lessonIndex = 1; lessonIndex <= lessonCount; lessonIndex++)
                    {
                        lessonCounter++;
                        var duration = 420 + rng.Next(0, 901); // 7 - 22 phút
                        var lessonCreatedAt = chapterCreatedAt.AddMinutes(lessonIndex * 3);

                        var lesson = new Lesson
                        {
                            Id = Guid.NewGuid(),
                            ChapterId = chapter.Id,
                            Title = $"Lesson {chapterIndex}.{lessonIndex}",
                            Description = $"Lesson {chapterIndex}.{lessonIndex} in {course.Title}",
                            VideoUrl = $"https://videos.skillmetrix.dev/{course.Id}/{chapter.Id}/{lessonIndex}",
                            DurationSeconds = duration,
                            IsFreePreview = chapterIndex == 1 && lessonIndex <= 2,
                            OrderIndex = lessonIndex,
                            CreatedAt = lessonCreatedAt,
                            UpdatedAt = lessonCreatedAt
                        };

                        lessons.Add(lesson);
                        lessonsForCourse.Add(lesson);
                    }
                }

                var totalMinutes = (int)Math.Ceiling(lessonsForCourse.Sum(x => x.DurationSeconds) / 60.0);
                course.DurationMinutes = totalMinutes;
                lessonsByCourse[course.Id] = lessonsForCourse;
            }
        }

        _context.Courses.AddRange(courses);
        _context.Chapters.AddRange(chapters);
        _context.Lessons.AddRange(lessons);
        await _context.SaveChangesAsync();

        var publishedCourses = courses.Where(c => c.Status == CourseStatus.Published).OrderBy(c => c.CreatedAt).ToList();

        foreach (var (student, studentIndex) in students.Select((value, index) => (value, index)))
        {
            var takeCount = 2 + (studentIndex % 2); // 2 or 3 courses
            var selectedCourses = publishedCourses
                .Skip(studentIndex % Math.Max(1, publishedCourses.Count - 2))
                .Take(takeCount)
                .ToList();

            foreach (var course in selectedCourses)
            {
                var enrolledAt = now.AddDays(-20 + (studentIndex % 10));

                var enrollment = new Enrollment
                {
                    Id = Guid.NewGuid(),
                    UserId = student.Id,
                    CourseId = course.Id,
                    PricePaid = course.Price,
                    EnrolledAt = enrolledAt
                };
                enrollments.Add(enrollment);

                transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid(),
                    UserId = student.Id,
                    EnrollmentId = enrollment.Id,
                    CourseId = course.Id,
                    Amount = course.Price,
                    Type = TransactionType.Purchase,
                    Status = TransactionStatus.Completed,
                    Description = $"Purchase {course.Title}",
                    CreatedAt = enrolledAt
                });

                var courseLessons = lessonsByCourse[course.Id].OrderBy(x => x.OrderIndex).ThenBy(x => x.CreatedAt).ToList();
                var progressCount = Math.Max(1, (int)Math.Floor(courseLessons.Count * (0.35 + (studentIndex % 4) * 0.15)));

                for (var i = 0; i < progressCount; i++)
                {
                    var lesson = courseLessons[i];
                    var isCompleted = (i % 3) != 0;
                    var minCompletedSecond = (int)Math.Ceiling(lesson.DurationSeconds * 0.9);
                    var watchedSecond = isCompleted
                        ? Math.Min(lesson.DurationSeconds, Math.Max(minCompletedSecond, lesson.DurationSeconds - 5))
                        : Math.Max(30, (int)Math.Ceiling(lesson.DurationSeconds * 0.5));

                    var lastUpdatedAt = enrolledAt.AddDays(1 + i);

                    progresses.Add(new UserLessonProgress
                    {
                        UserId = student.Id,
                        LessonId = lesson.Id,
                        IsCompleted = isCompleted,
                        LastWatchedSecond = watchedSecond,
                        LastUpdatedAt = lastUpdatedAt,
                        CompletedAt = isCompleted ? lastUpdatedAt : null
                    });
                }
            }
        }

        _context.Enrollments.AddRange(enrollments);
        _context.Transactions.AddRange(transactions);
        _context.UserLessonProgresses.AddRange(progresses);
        await _context.SaveChangesAsync();

        return new SeedSummaryDto
        {
            Message = "Strict relational seed created successfully.",
            Counts = new SeedCountDto
            {
                Users = users.Count,
                Courses = courses.Count,
                PublishedCourses = publishedCourses.Count,
                Chapters = chapters.Count,
                Lessons = lessons.Count,
                Enrollments = enrollments.Count,
                Transactions = transactions.Count,
                LessonProgressRecords = progresses.Count
            }
        };
    }

    private static User CreateUser(string email, string fullName, UserRole role)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            UserName = email,
            Email = email,
            FullName = fullName,
            Role = role,
            EmailConfirmed = true,
            PhoneNumberConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };
    }
}

public class SeedSummaryDto
{
    public string Message { get; set; } = string.Empty;
    public string DefaultPassword { get; set; } = DataSeederService.DefaultPassword;
    public SeedCountDto Counts { get; set; } = new();
    public List<SeedCredentialDto> Credentials { get; set; } = [];
}

public class SeedCountDto
{
    public int Users { get; set; }
    public int Courses { get; set; }
    public int PublishedCourses { get; set; }
    public int Chapters { get; set; }
    public int Lessons { get; set; }
    public int Enrollments { get; set; }
    public int Transactions { get; set; }
    public int LessonProgressRecords { get; set; }
}

public class SeedCredentialDto
{
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = DataSeederService.DefaultPassword;
}
