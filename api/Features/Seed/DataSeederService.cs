using Microsoft.AspNetCore.Identity;

namespace SkillMetrix_LMS.API.Features.Seed;

public class DataSeederService(
    ApplicationDbContext context,
    UserManager<User> userManager,
    RoleManager<IdentityRole<Guid>> roleManager,
    IWebHostEnvironment environment)
{
    public const string DefaultPassword = "Password@123";

    public async Task<SeedSummaryDto> ResetAndSeedStrictInternalAsync()
    {
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

    public async Task<Result<SeedSummaryDto>> ResetAndSeedStrictAsync()
    {
        if (!environment.IsDevelopment())
            return Result<SeedSummaryDto>.Forbidden("Seed API is allowed only in Development mode.");

        return await ResetAndSeedStrictInternalAsync();
    }

    /// <summary>
    /// seed chỉ users với các role (không có course, chapter, lesson...).
    /// </summary>
    public async Task<Result<SeedSummaryDto>> ResetAndSeedCustomAsync(SeedOptionsDto options)
    {
        if (!environment.IsDevelopment())
            return Result<SeedSummaryDto>.Forbidden("Seed API is allowed only in Development mode.");

        await ResetAllDataInternalAsync();
        await EnsureRolesAsync();

        var users = await SeedUsersCustomAsync(options);
        var summary = await SeedLearningDataCustomAsync(users, options);

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

    public async Task<Result<SeedSummaryDto>> SeedUsersOnlyAsync()
    {
        if (!environment.IsDevelopment())
            return Result<SeedSummaryDto>.Forbidden("Seed API is allowed only in Development mode.");

        await ResetAllDataInternalAsync();
        await EnsureRolesAsync();

        var users = await SeedUsersAsync();

        var summary = new SeedSummaryDto
        {
            DefaultPassword = DefaultPassword,
            Counts = new SeedCountDto { Users = users.Count },
            Credentials = users
                .OrderBy(x => x.Role)
                .ThenBy(x => x.Email)
                .Select(x => new SeedCredentialDto
                {
                    Role = x.Role.ToString(),
                    Email = x.Email!,
                    FullName = x.FullName,
                    Password = DefaultPassword
                })
                .ToList()
        };

        return summary;
    }

    public async Task<Result> ResetAllDataAsync()
    {
        if (!environment.IsDevelopment())
            return Result.Forbidden("Seed API is allowed only in Development mode.");

        await ResetAllDataInternalAsync();
        return Result.Success();
    }

    private async Task ResetAllDataInternalAsync()
    {
        context.UserLessonProgresses.RemoveRange(context.UserLessonProgresses);
        context.Transactions.RemoveRange(context.Transactions);
        context.Enrollments.RemoveRange(context.Enrollments);
        context.RefreshTokens.RemoveRange(context.RefreshTokens);
        context.QuizAttemptAnswers.RemoveRange(context.QuizAttemptAnswers);
        context.QuizAttempts.RemoveRange(context.QuizAttempts);
        context.QuizOptions.RemoveRange(context.QuizOptions);
        context.QuizQuestions.RemoveRange(context.QuizQuestions);
        context.Quizzes.RemoveRange(context.Quizzes);
        context.CourseReviews.RemoveRange(context.CourseReviews);
        context.Certificates.RemoveRange(context.Certificates);

        context.LessonDocuments.RemoveRange(context.LessonDocuments);
        context.LessonNotes.RemoveRange(context.LessonNotes);
        context.LessonAnswers.RemoveRange(context.LessonAnswers);
        context.LessonQuestions.RemoveRange(context.LessonQuestions);

        context.Lessons.RemoveRange(context.Lessons);
        context.Chapters.RemoveRange(context.Chapters);
        context.Courses.RemoveRange(context.Courses);

        context.UserTokens.RemoveRange(context.UserTokens);
        context.UserLogins.RemoveRange(context.UserLogins);
        context.UserClaims.RemoveRange(context.UserClaims);
        context.UserRoles.RemoveRange(context.UserRoles);
        context.RoleClaims.RemoveRange(context.RoleClaims);
        context.Roles.RemoveRange(context.Roles);
        context.Users.RemoveRange(context.Users);

        await context.SaveChangesAsync();
    }

    private async Task EnsureRolesAsync()
    {
        var roleNames = new[]
        {
            nameof(UserRole.Admin),
            nameof(UserRole.Moderator),
            nameof(UserRole.Instructor),
            nameof(UserRole.Student)
        };

        foreach (var roleName in roleNames)
        {
            if (await roleManager.RoleExistsAsync(roleName))
                continue;

            var createRoleResult = await roleManager.CreateAsync(new IdentityRole<Guid>
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
            CreateUser("admin@skillmetrix.dev", "Nguyễn Minh Đức", UserRole.Admin),
            CreateUser("moderator1@skillmetrix.dev", "Lê Văn Tùng", UserRole.Moderator),
            CreateUser("moderator2@skillmetrix.dev", "Phạm Hải Đăng", UserRole.Moderator),
            CreateUser("instructor1@skillmetrix.dev", "Lê Hoàng Long", UserRole.Instructor),
            CreateUser("instructor2@skillmetrix.dev", "Phạm Minh Tuấn", UserRole.Instructor),
            CreateUser("instructor3@skillmetrix.dev", "Trần Thị Hồng Hạnh", UserRole.Instructor),
            CreateUser("instructor4@skillmetrix.dev", "Nguyễn Anh Tú", UserRole.Instructor),
            CreateUser("instructor5@skillmetrix.dev", "Hoàng Văn Nam", UserRole.Instructor),
            CreateUser("instructor6@skillmetrix.dev", "Đặng Minh Trí", UserRole.Instructor)
        };

        var studentNames = new[] {
            "Nguyễn Thu Trang", "Đỗ Minh Quân", "Trần Việt Anh", "Phạm Thùy Linh", "Lê Tuấn Kiệt",
            "Bùi Hồng Đăng", "Vũ Hoàng My", "Phan Gia Huy", "Đặng Khánh Vy", "Nguyễn Minh Triết",
            "Hoàng Bảo Ngọc", "Lý Thanh Bình", "Tạ Minh Châu", "Ngô Tiến Đạt", "Dương Cát Tường",
            "Mai Phương Thảo", "Trịnh Hữu Phước", "Phan Thanh Sơn"
        };

        for (var i = 1; i <= 18; i++)
        {
            var name = i - 1 < studentNames.Length ? studentNames[i - 1] : $"Học viên {i:00}";
            users.Add(CreateUser($"student{i}@skillmetrix.dev", name, UserRole.Student));
        }

        foreach (var user in users)
        {
            var createResult = await userManager.CreateAsync(user, DefaultPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Create user '{user.Email}' failed: {errors}");
            }

            var addRoleResult = await userManager.AddToRoleAsync(user, user.Role.ToString());
            if (!addRoleResult.Succeeded)
            {
                var errors = string.Join(", ", addRoleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Assign role for '{user.Email}' failed: {errors}");
            }
        }

        return users;
    }

    private async Task<List<User>> SeedUsersCustomAsync(SeedOptionsDto options)
    {
        var users = new List<User>();

        for (var i = 0; i < options.AdminCount; i++)
            users.Add(CreateUser($"admin{i + 1}@skillmetrix.dev", $"Admin {i + 1}", UserRole.Admin));

        for (var i = 0; i < options.ModeratorCount; i++)
            users.Add(CreateUser($"moderator{i + 1}@skillmetrix.dev", $"Moderator {i + 1}", UserRole.Moderator));

        for (var i = 0; i < options.InstructorCount; i++)
            users.Add(CreateUser($"instructor{i + 1}@skillmetrix.dev", $"Instructor {i + 1}", UserRole.Instructor));

        for (var i = 0; i < options.StudentCount; i++)
            users.Add(CreateUser($"student{i + 1}@skillmetrix.dev", $"Student {i + 1:D3}", UserRole.Student));

        foreach (var user in users)
        {
            var createResult = await userManager.CreateAsync(user, DefaultPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Create user '{user.Email}' failed: {errors}");
            }

            var addRoleResult = await userManager.AddToRoleAsync(user, user.Role.ToString());
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

        var realCoursesData = new[]
        {
            new {
                Title = "Lập trình C# ASP.NET Core Web API cho người mới",
                Desc = "Khóa học cung cấp kiến thức nền tảng về C# OOP và cách xây dựng ứng dụng Web API chuẩn RESTful sử dụng .NET 8.",
                Thumb = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=640&q=80",
                Price = 299000,
                Chapters = new[] { "Giới thiệu & Cài đặt môi trường", "Cú pháp C# căn bản", "Lập trình hướng đối tượng (OOP)", "Xây dựng Web API đầu tiên" },
                Lessons = new[] { "Tổng quan về .NET và C#", "Cài đặt Visual Studio & .NET SDK", "Chương trình Hello World đầu tiên", "Biến, kiểu dữ liệu và toán tử" },
                Videos = new[] { "https://www.youtube.com/watch?v=GhQdlIFylQ8", "https://www.youtube.com/watch?v=F399Z5jP2j0", "https://www.youtube.com/watch?v=GhQdlIFylQ8", "https://www.youtube.com/watch?v=F399Z5jP2j0" }
            },
            new {
                Title = "Khóa học React.js & TypeScript chuyên sâu",
                Desc = "Hướng dẫn xây dựng các ứng dụng Single Page Application (SPA) tối ưu hiệu năng, áp dụng React Hook, Zustand, React Query và Tailwind CSS.",
                Thumb = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=640&q=80",
                Price = 399000,
                Chapters = new[] { "Làm quen với React & Modern JS", "State Management & Side Effects", "Routing với React Router DOM", "Tích hợp TypeScript vào React" },
                Lessons = new[] { "React.js là gì? Tại sao nên chọn React?", "Khởi tạo dự án React bằng Vite", "JSX & Component trong React", "Props và State trong Component" },
                Videos = new[] { "https://www.youtube.com/watch?v=SqcY0GlETPk", "https://www.youtube.com/watch?v=Ke90Tje7VS0", "https://www.youtube.com/watch?v=SqcY0GlETPk", "https://www.youtube.com/watch?v=Ke90Tje7VS0" }
            },
            new {
                Title = "Database Design & SQL Server cơ bản đến nâng cao",
                Desc = "Làm chủ thiết kế cơ sở dữ liệu quan hệ, tối ưu câu lệnh truy vấn SQL, làm việc với Index, Trigger, Store Procedure và View.",
                Thumb = "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=640&q=80",
                Price = 199000,
                Chapters = new[] { "Cơ sở dữ liệu quan hệ và SQL Server", "Các câu lệnh truy vấn SQL căn bản", "Liên kết bảng (JOIN) và Subquery", "Tối ưu hóa Performance với Index" },
                Lessons = new[] { "Giới thiệu DBMS và SQL Server", "Cài đặt SSMS và LocalDB", "Tạo Database và Table đầu tiên", "Truy vấn dữ liệu với lệnh SELECT" },
                Videos = new[] { "https://www.youtube.com/watch?v=HXV3zeQKqGY", "https://www.youtube.com/watch?v=7S_tz1z_5bA", "https://www.youtube.com/watch?v=HXV3zeQKqGY", "https://www.youtube.com/watch?v=7S_tz1z_5bA" }
            },
            new {
                Title = "Triển khai CI/CD và Cloud DevOps với AWS",
                Desc = "Học cách thiết lập pipeline CI/CD tự động build & deploy ứng dụng lên AWS EC2, ECS bằng GitHub Actions và Docker.",
                Thumb = "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=640&q=80",
                Price = 599000,
                Chapters = new[] { "Tổng quan về DevOps và Cloud computing", "Container hóa với Docker", "Thiết lập GitHub Actions CI/CD", "Deploy ứng dụng lên AWS EC2" },
                Lessons = new[] { "DevOps là gì? Vai trò của CI/CD", "Cơ bản về Container và Virtual Machine", "Cài đặt Docker Desktop và Dockerfile", "Build docker image và push lên Hub" },
                Videos = new[] { "https://www.youtube.com/watch?v=R8_veKoTfUY", "https://www.youtube.com/watch?v=scEDHsr3APg", "https://www.youtube.com/watch?v=R8_veKoTfUY", "https://www.youtube.com/watch?v=scEDHsr3APg" }
            },
            new {
                Title = "Thiết kế UI/UX hiện đại cho Web & Mobile",
                Desc = "Quy trình thiết kế sản phẩm hoàn chỉnh: từ User Research, Wireframe, Prototype cho đến thiết kế giao diện chi tiết bằng Figma.",
                Thumb = "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=640&q=80",
                Price = 349000,
                Chapters = new[] { "Nhập môn Thiết kế UI/UX", "Nghiên cứu người dùng & User Flow", "Tạo Wireframe và Lo-fi Prototype", "Thiết kế giao diện bằng Figma" },
                Lessons = new[] { "UI và UX khác nhau như thế nào?", "Quy trình tư duy thiết kế Design Thinking", "Làm quen với giao diện Figma", "Tạo các Frame và Shapes căn bản" },
                Videos = new[] { "https://www.youtube.com/watch?v=c9Wg6RyOxxo", "https://www.youtube.com/watch?v=FTFaQWZBqA8", "https://www.youtube.com/watch?v=c9Wg6RyOxxo", "https://www.youtube.com/watch?v=FTFaQWZBqA8" }
            },
            new {
                Title = "Clean Architecture chuyên sâu trong .NET",
                Desc = "Áp dụng cấu trúc Clean Architecture cho dự án Web API .NET Core thực tế, kết hợp CQRS (MediatR) và FluentValidation.",
                Thumb = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=640&q=80",
                Price = 499000,
                Chapters = new[] { "Giới thiệu Clean Architecture", "Thiết kế Domain Layer", "Xây dựng Application Layer (CQRS)", "Tạo Presentation Layer (Web API)" },
                Lessons = new[] { "Monolith vs Clean Architecture", "Định nghĩa Entities và Value Objects", "Repository Pattern & Unit of Work", "Cài đặt MediatR và Command Handler" },
                Videos = new[] { "https://www.youtube.com/watch?v=yF9SwS7pP60", "https://www.youtube.com/watch?v=Wz5V97gJ2wU", "https://www.youtube.com/watch?v=yF9SwS7pP60", "https://www.youtube.com/watch?v=Wz5V97gJ2wU" }
            }
        };

        var courseIndexGlobal = 0;
        foreach (var (instructor, instructorIndex) in instructors.Select((value, index) => (value, index)))
        {
            var statuses = new[] { CourseStatus.Published, CourseStatus.Pending, CourseStatus.Draft };

            for (var courseSlot = 0; courseSlot < statuses.Length; courseSlot++)
            {
                var status = statuses[courseSlot];
                var createdAt = now.AddDays(-60 + instructorIndex * 5 + courseSlot * 2);

                string title;
                string description;
                string thumbnail;
                int price;
                string[] customChapters = null;
                string[] customLessons = null;
                string[] customVideos = null;

                if (courseIndexGlobal < realCoursesData.Length)
                {
                    var data = realCoursesData[courseIndexGlobal];
                    title = data.Title;
                    description = data.Desc;
                    thumbnail = data.Thumb;
                    price = data.Price;
                    customChapters = data.Chapters;
                    customLessons = data.Lessons;
                    customVideos = data.Videos;
                }
                else
                {
                    title = $"{instructor.FullName} - Khóa học Lập trình chuyên sâu {courseSlot + 1}";
                    description = $"Khóa học hướng dẫn thực hành xây dựng ứng dụng thực tế do giảng viên {instructor.FullName} giảng dạy.";
                    thumbnail = $"https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=640&q=80";
                    price = 199000 + instructorIndex * 25000 + courseSlot * 15000;
                }

                var course = new Course
                {
                    Id = Guid.NewGuid(),
                    Title = title,
                    Description = description,
                    InstructorId = instructor.Id,
                    Status = status,
                    Price = price,
                    Thumbnail = thumbnail,
                    CreatedAt = createdAt,
                    PublishedAt = status == CourseStatus.Published ? createdAt.AddDays(2) : null,
                    UpdatedAt = createdAt.AddDays(1),
                    IsDeleted = false
                };

                courses.Add(course);

                var chapterCount = customChapters != null ? customChapters.Length : 3 + (courseSlot % 2); // 3 or 4
                var lessonsForCourse = new List<Lesson>();

                for (var chapterIndex = 1; chapterIndex <= chapterCount; chapterIndex++)
                {
                    var chapterCreatedAt = createdAt.AddHours(chapterIndex);
                    var chapterTitle = customChapters != null ? customChapters[chapterIndex - 1] : $"Chương {chapterIndex}: Nội dung cốt lõi {chapterIndex}";

                    var chapter = new Chapter
                    {
                        Id = Guid.NewGuid(),
                        CourseId = course.Id,
                        Title = chapterTitle,
                        Description = $"{chapterTitle} thuộc {course.Title}",
                        OrderIndex = chapterIndex,
                        CreatedAt = chapterCreatedAt,
                        UpdatedAt = chapterCreatedAt
                    };

                    chapters.Add(chapter);

                    var lessonCount = customLessons != null ? customLessons.Length : 4 + (chapterIndex % 2); // 4 or 5
                    for (var lessonIndex = 1; lessonIndex <= lessonCount; lessonIndex++)
                    {
                        var duration = 420 + rng.Next(0, 901); // 7 - 22 phút
                        var lessonCreatedAt = chapterCreatedAt.AddMinutes(lessonIndex * 3);

                        string lessonTitle;
                        string videoUrl;

                        if (customLessons != null && lessonIndex <= customLessons.Length)
                        {
                            lessonTitle = $"Bài {chapterIndex}.{lessonIndex}: {customLessons[lessonIndex - 1]} (Phần {chapterIndex})";
                        }
                        else
                        {
                            lessonTitle = $"Bài {chapterIndex}.{lessonIndex}: Lý thuyết và thực hành phần {lessonIndex}";
                        }

                        var youtubeVideos = new[]
                        {
                            "https://www.youtube.com/watch?v=Ke90Tje7VS0",
                            "https://www.youtube.com/watch?v=c9Wg6RyOxxo",
                            "https://www.youtube.com/watch?v=GhQdlIFylQ8",
                            "https://www.youtube.com/watch?v=F399Z5jP2j0",
                            "https://www.youtube.com/watch?v=yF9SwS7pP60",
                            "https://www.youtube.com/watch?v=Wz5V97gJ2wU",
                            "https://www.youtube.com/watch?v=SqcY0GlETPk",
                            "https://www.youtube.com/watch?v=HXV3zeQKqGY",
                            "https://www.youtube.com/watch?v=7S_tz1z_5bA",
                            "https://www.youtube.com/watch?v=R8_veKoTfUY",
                            "https://www.youtube.com/watch?v=scEDHsr3APg",
                            "https://www.youtube.com/watch?v=FTFaQWZBqA8"
                        };

                        if (customVideos != null && lessonIndex - 1 < customVideos.Length)
                        {
                            videoUrl = customVideos[lessonIndex - 1];
                        }
                        else
                        {
                            videoUrl = youtubeVideos[rng.Next(youtubeVideos.Length)];
                        }

                        var lesson = new Lesson
                        {
                            Id = Guid.NewGuid(),
                            ChapterId = chapter.Id,
                            Title = lessonTitle,
                            Description = $"Nội dung chi tiết của {lessonTitle} trong {course.Title}",
                            VideoUrl = videoUrl,
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

                courseIndexGlobal++;
            }
        }

        context.Courses.AddRange(courses);
        context.Chapters.AddRange(chapters);
        context.Lessons.AddRange(lessons);
        await context.SaveChangesAsync();

        // ─── Seed Quizzes ──────────────────────────────────────────────────────
        var quizzes = new List<Quiz>();
        var quizQuestions = new List<QuizQuestion>();
        var quizOptions = new List<QuizOption>();
        var quizAttempts = new List<QuizAttempt>();
        var quizAttemptAnswers = new List<QuizAttemptAnswer>();

        var quizTitles = new[]
        {
            "Knowledge Check Quiz",
            "Final Examination",
            "Module Assessment",
            "Practice Test",
            "Chapter Review Quiz"
        };

        foreach (var course in courses.Where(c => c.Status == CourseStatus.Published))
        {
            var isFinalQuiz = true;
            for (var qi = 0; qi < 2; qi++)
            {
                var quizId = Guid.NewGuid();
                var quiz = new Quiz
                {
                    Id = quizId,
                    CourseId = course.Id,
                    Title = qi == 1 ? $"Final Exam - {course.Title}" : $"{quizTitles[rng.Next(quizTitles.Length)]}",
                    Description = $"Assessment quiz for {course.Title}",
                    PassingScore = 70,
                    TimeLimitMinutes = qi == 1 ? 30 : 15,
                    MaxAttempts = qi == 1 ? 2 : 3,
                    IsFinalQuiz = isFinalQuiz,
                    CreatedAt = course.CreatedAt.AddHours(5),
                    IsDeleted = false
                };
                quizzes.Add(quiz);

                // 3-5 questions per quiz
                var questionCount = 3 + rng.Next(3);
                for (var qi2 = 0; qi2 < questionCount; qi2++)
                {
                    var questionId = Guid.NewGuid();
                    var question = new QuizQuestion
                    {
                        Id = questionId,
                        QuizId = quizId,
                        Content = $"Question {qi2 + 1}: What is the correct answer for topic related to {course.Title}?",
                        Point = 1,
                        OrderIndex = qi2 + 1
                    };
                    quizQuestions.Add(question);

                    // 4 options per question, 1 correct
                    var correctIndex = rng.Next(4);
                    var optionTexts = new[]
                    {
                        $"Correct answer for {course.Title}",
                        $"Incorrect answer A for {course.Title}",
                        $"Incorrect answer B for {course.Title}",
                        $"Incorrect answer C for {course.Title}"
                    };

                    for (var oi = 0; oi < 4; oi++)
                    {
                        quizOptions.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = questionId,
                            Content = optionTexts[oi],
                            IsCorrect = oi == correctIndex,
                            OrderIndex = oi + 1
                        });
                    }
                }
            }
        }

        context.Quizzes.AddRange(quizzes);
        context.QuizQuestions.AddRange(quizQuestions);
        context.QuizOptions.AddRange(quizOptions);
        await context.SaveChangesAsync();

        // Quiz Attempts are seeded below after Enrollments are populated

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

        context.Enrollments.AddRange(enrollments);
        context.Transactions.AddRange(transactions);
        context.UserLessonProgresses.AddRange(progresses);
        await context.SaveChangesAsync();

        // ─── Seed Quiz Attempts for some students (now that Enrollments are populated) ───
        foreach (var student in students.Take(6))
        {
            var enrolledCourses = enrollments
                .Where(e => e.UserId == student.Id)
                .Select(e => courses.First(c => c.Id == e.CourseId))
                .ToList();

            foreach (var course in enrolledCourses.Take(1))
            {
                var courseQuizzes = quizzes.Where(q => q.CourseId == course.Id && q.IsFinalQuiz).ToList();
                foreach (var quiz in courseQuizzes)
                {
                    var attemptId = Guid.NewGuid();
                    var quizQuestionsList = quizQuestions.Where(q => q.QuizId == quiz.Id).ToList();
                    var attempt = new QuizAttempt
                    {
                        Id = attemptId,
                        QuizId = quiz.Id,
                        UserId = student.Id,
                        Score = rng.Next(50, 101),
                        IsPassed = rng.Next(100) > 30,
                        StartedAt = DateTime.UtcNow.AddDays(-rng.Next(1, 10)),
                        SubmittedAt = DateTime.UtcNow.AddDays(-rng.Next(1, 10))
                    };
                    attempt.Score = Math.Max(attempt.Score, quiz.PassingScore - 1);
                    attempt.IsPassed = attempt.Score >= quiz.PassingScore;
                    quizAttempts.Add(attempt);

                    foreach (var question in quizQuestionsList.Take(2))
                    {
                        var options = quizOptions.Where(o => o.QuestionId == question.Id).ToList();
                        var correctOption = options.First(o => o.IsCorrect);
                        var selectedOption = rng.Next(100) > 20 ? correctOption : options[rng.Next(options.Count)];

                        quizAttemptAnswers.Add(new QuizAttemptAnswer
                        {
                            Id = Guid.NewGuid(),
                            AttemptId = attemptId,
                            QuestionId = question.Id,
                            SelectedOptionId = selectedOption.Id,
                            IsCorrect = selectedOption.IsCorrect
                        });
                    }
                }
            }
        }

        context.QuizAttempts.AddRange(quizAttempts);
        context.QuizAttemptAnswers.AddRange(quizAttemptAnswers);
        await context.SaveChangesAsync();

        // ─── Seed Course Reviews & Recalculate Course Ratings ────────────────────
        var reviews = new List<CourseReview>();
        var reviewComments = new[]
        {
            "Khóa học rất hay và chi tiết, giảng viên hỗ trợ nhiệt tình.",
            "Nội dung chuẩn chỉnh, thực hành rất thực tế.",
            "Rất đáng đồng tiền, kiến thức áp dụng được ngay vào công việc.",
            "Bài giảng dễ hiểu, ví dụ sinh động.",
            "Tài liệu phong phú, giải thích cặn kẽ từng dòng code.",
            "Kiến thức nâng cao sâu sắc, phù hợp cho người muốn nâng trình.",
            "Một khóa học tuyệt vời về chủ đề này, vote 5 sao!",
            "Giảng viên giải thích rất dễ tiếp thu, tốc độ vừa phải.",
            "Có nhiều case study thực tế rất hay.",
            "Rất hài lòng với chất lượng bài học và sự hỗ trợ."
        };

        foreach (var course in courses.Where(c => c.Status == CourseStatus.Published))
        {
            var courseEnrollments = enrollments.Where(e => e.CourseId == course.Id).ToList();
            var ratingsList = new List<int>();

            foreach (var enrollment in courseEnrollments.Take(3))
            {
                var rating = rng.Next(4, 6); // 4 or 5 stars
                ratingsList.Add(rating);

                reviews.Add(new CourseReview
                {
                    Id = Guid.NewGuid(),
                    CourseId = course.Id,
                    UserId = enrollment.UserId,
                    Rating = rating,
                    Comment = reviewComments[rng.Next(reviewComments.Length)],
                    CreatedAt = enrollment.EnrolledAt.AddDays(rng.Next(1, 5))
                });
            }

            if (ratingsList.Any())
            {
                course.Rating = (decimal)ratingsList.Average();
            }
        }

        context.CourseReviews.AddRange(reviews);
        await context.SaveChangesAsync();

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
                LessonProgressRecords = progresses.Count,
                Quizzes = quizzes.Count,
                QuizQuestions = quizQuestions.Count,
                QuizAttempts = quizAttempts.Count
            }
        };
    }

    private async Task<SeedSummaryDto> SeedLearningDataCustomAsync(List<User> users, SeedOptionsDto options)
    {
        var rng = new Random(options.Seed ?? Environment.TickCount);
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
            var publishedSlot = 0;

            for (var courseSlot = 0; courseSlot < options.CoursesPerInstructor; courseSlot++)
            {
                var status = courseSlot == publishedSlot ? CourseStatus.Published : CourseStatus.Draft;
                var createdAt = now.AddDays(-30 + instructorIndex * 3 + courseSlot);

                var course = new Course
                {
                    Id = Guid.NewGuid(),
                    Title = $"{instructor.FullName} Course {courseSlot + 1}",
                    Description = $"Course {courseSlot + 1} by {instructor.FullName}",
                    InstructorId = instructor.Id,
                    Status = status,
                    Price = 199000 + rng.Next(0, 500001),
                    Thumbnail = $"https://picsum.photos/seed/{instructorIndex}-{courseSlot}/640/360",
                    CreatedAt = createdAt,
                    PublishedAt = status == CourseStatus.Published ? createdAt.AddDays(1) : null,
                    UpdatedAt = createdAt.AddHours(1),
                    IsDeleted = false
                };

                courses.Add(course);

                var lessonsForCourse = new List<Lesson>();

                for (var chapterIndex = 1; chapterIndex <= options.ChaptersPerCourse; chapterIndex++)
                {
                    var chapterCreatedAt = createdAt.AddHours(chapterIndex);

                    var chapter = new Chapter
                    {
                        Id = Guid.NewGuid(),
                        CourseId = course.Id,
                        Title = $"Chapter {chapterIndex}",
                        Description = $"Chapter {chapterIndex}",
                        OrderIndex = chapterIndex,
                        CreatedAt = chapterCreatedAt,
                        UpdatedAt = chapterCreatedAt
                    };

                    chapters.Add(chapter);

                    for (var lessonIndex = 1; lessonIndex <= options.LessonsPerChapter; lessonIndex++)
                    {
                        var duration = 300 + rng.Next(0, 1201);
                        var lessonCreatedAt = chapterCreatedAt.AddMinutes(lessonIndex * 2);

                        var lesson = new Lesson
                        {
                            Id = Guid.NewGuid(),
                            ChapterId = chapter.Id,
                            Title = $"Lesson {chapterIndex}.{lessonIndex}",
                            Description = $"Lesson {chapterIndex}.{lessonIndex}",
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

        context.Courses.AddRange(courses);
        context.Chapters.AddRange(chapters);
        context.Lessons.AddRange(lessons);
        await context.SaveChangesAsync();

        // ─── Quizzes ─────────────────────────────────────────────────────────
        var quizzes = new List<Quiz>();
        var quizQuestions = new List<QuizQuestion>();
        var quizOptions = new List<QuizOption>();
        var quizAttempts = new List<QuizAttempt>();
        var quizAttemptAnswers = new List<QuizAttemptAnswer>();

        foreach (var course in courses.Where(c => c.Status == CourseStatus.Published))
        {
            for (var qi = 0; qi < options.QuizzesPerCourse; qi++)
            {
                var quizId = Guid.NewGuid();
                var quiz = new Quiz
                {
                    Id = quizId,
                    CourseId = course.Id,
                    Title = qi == options.QuizzesPerCourse - 1 ? $"Final Exam - {course.Title}" : $"Quiz {qi + 1}",
                    Description = $"Assessment for {course.Title}",
                    PassingScore = 70,
                    TimeLimitMinutes = qi == options.QuizzesPerCourse - 1 ? 30 : 15,
                    MaxAttempts = 3,
                    IsFinalQuiz = qi == options.QuizzesPerCourse - 1,
                    CreatedAt = course.CreatedAt.AddHours(4),
                    IsDeleted = false
                };
                quizzes.Add(quiz);

                for (var qi2 = 0; qi2 < options.QuestionsPerQuiz; qi2++)
                {
                    var questionId = Guid.NewGuid();
                    var question = new QuizQuestion
                    {
                        Id = questionId,
                        QuizId = quizId,
                        Content = $"Question {qi2 + 1}: Sample question for {course.Title}?",
                        Point = 1,
                        OrderIndex = qi2 + 1
                    };
                    quizQuestions.Add(question);

                    var correctIndex = rng.Next(4);
                    for (var oi = 0; oi < 4; oi++)
                    {
                        quizOptions.Add(new QuizOption
                        {
                            Id = Guid.NewGuid(),
                            QuestionId = questionId,
                            Content = oi == correctIndex ? $"Correct answer for Q{qi2 + 1}" : $"Incorrect option {oi} for Q{qi2 + 1}",
                            IsCorrect = oi == correctIndex,
                            OrderIndex = oi + 1
                        });
                    }
                }
            }
        }

        context.Quizzes.AddRange(quizzes);
        context.QuizQuestions.AddRange(quizQuestions);
        context.QuizOptions.AddRange(quizOptions);
        await context.SaveChangesAsync();

        // ─── Quiz Attempts ───────────────────────────────────────────────────
        foreach (var student in students.Take(Math.Min(3, students.Count)))
        {
            foreach (var enrollment in enrollments.Where(e => e.UserId == student.Id).Take(1))
            {
                var courseQuizzes = quizzes.Where(q => q.CourseId == enrollment.CourseId).ToList();
                foreach (var quiz in courseQuizzes.Take(1))
                {
                    var attemptId = Guid.NewGuid();
                    var attemptScore = rng.Next(40, 101);
                    var attempt = new QuizAttempt
                    {
                        Id = attemptId,
                        QuizId = quiz.Id,
                        UserId = student.Id,
                        Score = attemptScore,
                        IsPassed = attemptScore >= quiz.PassingScore,
                        StartedAt = now.AddDays(-rng.Next(1, 8)),
                        SubmittedAt = now.AddDays(-rng.Next(1, 8))
                    };
                    quizAttempts.Add(attempt);

                    foreach (var q in quizQuestions.Where(q => q.QuizId == quiz.Id).Take(2))
                    {
                        var opts = quizOptions.Where(o => o.QuestionId == q.Id).ToList();
                        var selected = rng.Next(100) > 20 ? opts.First(o => o.IsCorrect) : opts[rng.Next(opts.Count)];
                        quizAttemptAnswers.Add(new QuizAttemptAnswer
                        {
                            Id = Guid.NewGuid(),
                            AttemptId = attemptId,
                            QuestionId = q.Id,
                            SelectedOptionId = selected.Id,
                            IsCorrect = selected.IsCorrect
                        });
                    }
                }
            }
        }

        context.QuizAttempts.AddRange(quizAttempts);
        context.QuizAttemptAnswers.AddRange(quizAttemptAnswers);
        await context.SaveChangesAsync();

        // ─── Enrollments, Transactions, Progress ─────────────────────────────
        var publishedCourses = courses.Where(c => c.Status == CourseStatus.Published).ToList();
        if (publishedCourses.Count == 0)
            publishedCourses = courses.ToList();

        foreach (var (student, studentIndex) in students.Select((value, index) => (value, index)))
        {
            var takeCount = Math.Min(options.EnrollmentsPerStudent, publishedCourses.Count);
            var selectedCourses = publishedCourses
                .Skip(studentIndex % Math.Max(1, publishedCourses.Count))
                .Take(takeCount)
                .ToList();

            foreach (var course in selectedCourses)
            {
                var enrolledAt = now.AddDays(-rng.Next(5, 31));

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

                var courseLessons = lessonsByCourse[course.Id].OrderBy(x => x.OrderIndex).ToList();
                var progressCount = (int)Math.Floor(courseLessons.Count * options.ProgressPerEnrollmentPercent / 100.0);

                for (var i = 0; i < Math.Min(progressCount, courseLessons.Count); i++)
                {
                    var lesson = courseLessons[i];
                    var isCompleted = rng.Next(100) > 30;
                    var watchedSecond = isCompleted
                        ? lesson.DurationSeconds
                        : rng.Next(30, lesson.DurationSeconds);

                    var lastUpdatedAt = enrolledAt.AddDays(i);

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

        context.Enrollments.AddRange(enrollments);
        context.Transactions.AddRange(transactions);
        context.UserLessonProgresses.AddRange(progresses);
        await context.SaveChangesAsync();

        return new SeedSummaryDto
        {
            Message = "Custom seed created successfully.",
            Counts = new SeedCountDto
            {
                Users = users.Count,
                Courses = courses.Count,
                PublishedCourses = courses.Count(c => c.Status == CourseStatus.Published),
                Chapters = chapters.Count,
                Lessons = lessons.Count,
                Enrollments = enrollments.Count,
                Transactions = transactions.Count,
                LessonProgressRecords = progresses.Count,
                Quizzes = quizzes.Count,
                QuizQuestions = quizQuestions.Count,
                QuizAttempts = quizAttempts.Count
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
    public int Quizzes { get; set; }
    public int QuizQuestions { get; set; }
    public int QuizAttempts { get; set; }
}

public class SeedCredentialDto
{
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = DataSeederService.DefaultPassword;
}

public class SeedOptionsDto
{
    public int AdminCount { get; set; } = 1;
    public int ModeratorCount { get; set; } = 2;
    public int InstructorCount { get; set; } = 6;
    public int StudentCount { get; set; } = 18;
    public int CoursesPerInstructor { get; set; } = 3;
    public int ChaptersPerCourse { get; set; } = 3;
    public int LessonsPerChapter { get; set; } = 4;
    public int QuizzesPerCourse { get; set; } = 2;
    public int QuestionsPerQuiz { get; set; } = 4;
    public int EnrollmentsPerStudent { get; set; } = 3;
    public int ProgressPerEnrollmentPercent { get; set; } = 60;
    public int? Seed { get; set; }
}
