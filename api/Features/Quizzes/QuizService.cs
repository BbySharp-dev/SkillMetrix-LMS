using SkillMetrix_LMS.API.Features.Quizzes.DTOs;

namespace SkillMetrix_LMS.API.Features.Quizzes;

public class QuizService(ApplicationDbContext context) : IQuizService
{
    // ─── Quiz CRUD ─────────────────────────────────────────────────────────────

    public async Task<Result<List<QuizResponseDto>>> GetQuizzesByCourseAsync(Guid courseId, Guid? actorId)
    {
        var course = await context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == courseId);
        if (course == null)
            return Result<List<QuizResponseDto>>.NotFound("Course not found");

        // Only course owner or admin can see all quizzes
        if (actorId.HasValue && course.InstructorId != actorId.Value)
        {
            // Students only see published final quizzes
            var quizzes = await context.Quizzes
                .AsNoTracking()
                .Include(q => q.Questions)
                .Where(q => q.CourseId == courseId && !q.IsDeleted && q.IsFinalQuiz)
                .ToListAsync();

            return quizzes.Select(MapToResponseDto).ToList();
        }

        var allQuizzes = await context.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
            .Where(q => q.CourseId == courseId && !q.IsDeleted)
            .ToListAsync();

        return allQuizzes.Select(MapToResponseDto).ToList();
    }

    public async Task<Result<QuizDetailResponseDto>> GetQuizByIdAsync(Guid quizId, Guid? actorId)
    {
        var quiz = await context.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
                .ThenInclude(q => q.Options.OrderBy(o => o.OrderIndex))
            .FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);

        if (quiz == null)
            return Result<QuizDetailResponseDto>.NotFound("Quiz not found");

        // Check authorization
        if (actorId.HasValue)
        {
            var course = await context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == quiz.CourseId);
            if (course != null && course.InstructorId != actorId.Value)
            {
                // Non-owner: only see final published quizzes
                if (!quiz.IsFinalQuiz)
                    return Result<QuizDetailResponseDto>.Forbidden("You don't have access to this quiz");
            }
        }

        return MapToDetailDto(quiz);
    }

    public async Task<Result<QuizResponseDto>> CreateQuizAsync(CreateQuizDto dto, Guid actorId)
    {
        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId);
        if (course == null)
            return Result<QuizResponseDto>.NotFound("Course not found");

        if (course.InstructorId != actorId)
            return Result<QuizResponseDto>.Forbidden("You can only create quizzes for your own courses");

        var quiz = new Quiz
        {
            Id = Guid.NewGuid(),
            CourseId = dto.CourseId,
            Title = dto.Title,
            Description = dto.Description,
            PassingScore = dto.PassingScore,
            TimeLimitMinutes = dto.TimeLimitMinutes,
            MaxAttempts = dto.MaxAttempts,
            IsFinalQuiz = dto.IsFinalQuiz,
            CreatedAt = DateTime.UtcNow
        };

        context.Quizzes.Add(quiz);
        await context.SaveChangesAsync();

        return MapToResponseDto(quiz);
    }

    public async Task<Result<QuizResponseDto>> UpdateQuizAsync(Guid quizId, UpdateQuizDto dto, Guid actorId)
    {
        var quiz = await context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);
        if (quiz == null)
            return Result<QuizResponseDto>.NotFound("Quiz not found");

        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == quiz.CourseId);
        if (course == null || course.InstructorId != actorId)
            return Result<QuizResponseDto>.Forbidden("You can only update your own quizzes");

        if (dto.Title != null) quiz.Title = dto.Title;
        if (dto.Description != null) quiz.Description = dto.Description;
        if (dto.PassingScore.HasValue) quiz.PassingScore = dto.PassingScore.Value;
        if (dto.TimeLimitMinutes.HasValue) quiz.TimeLimitMinutes = dto.TimeLimitMinutes.Value;
        if (dto.MaxAttempts.HasValue) quiz.MaxAttempts = dto.MaxAttempts.Value;
        if (dto.IsFinalQuiz.HasValue) quiz.IsFinalQuiz = dto.IsFinalQuiz.Value;
        quiz.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return MapToResponseDto(quiz);
    }

    public async Task<Result<bool>> DeleteQuizAsync(Guid quizId, Guid actorId)
    {
        var quiz = await context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);
        if (quiz == null)
            return Result<bool>.NotFound("Quiz not found");

        var course = await context.Courses.FirstOrDefaultAsync(c => c.Id == quiz.CourseId);
        if (course == null || course.InstructorId != actorId)
            return Result<bool>.Forbidden("You can only delete your own quizzes");

        quiz.IsDeleted = true;
        quiz.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return true;
    }

    // ─── Question CRUD ──────────────────────────────────────────────────────────

    public async Task<Result<QuestionResponseDto>> AddQuestionAsync(Guid quizId, CreateQuestionDto dto, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<QuestionResponseDto>.NotFound("Quiz not found");

        // Validate: must have at least 2 options
        if (dto.Options.Count < 2)
            return Result<QuestionResponseDto>.ValidationError("A question must have at least 2 options");

        // Validate: must have exactly 1 correct option
        var correctCount = dto.Options.Count(o => o.IsCorrect);
        if (correctCount != 1)
            return Result<QuestionResponseDto>.ValidationError("A question must have exactly 1 correct option");

        var question = new QuizQuestion
        {
            Id = Guid.NewGuid(),
            QuizId = quizId,
            Content = dto.Content,
            Point = dto.Point,
            OrderIndex = dto.OrderIndex
        };

        context.QuizQuestions.Add(question);

        foreach (var opt in dto.Options)
        {
            context.QuizOptions.Add(new QuizOption
            {
                Id = Guid.NewGuid(),
                QuestionId = question.Id,
                Content = opt.Content,
                IsCorrect = opt.IsCorrect,
                OrderIndex = opt.OrderIndex
            });
        }

        await context.SaveChangesAsync();

        var savedQuestion = await context.QuizQuestions
            .AsNoTracking()
            .Include(q => q.Options.OrderBy(o => o.OrderIndex))
            .FirstAsync(q => q.Id == question.Id);

        return MapToQuestionDto(savedQuestion);
    }

    public async Task<Result<QuestionResponseDto>> UpdateQuestionAsync(Guid quizId, Guid questionId, UpdateQuestionDto dto, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<QuestionResponseDto>.NotFound("Quiz not found");

        var question = await context.QuizQuestions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);

        if (question == null)
            return Result<QuestionResponseDto>.NotFound("Question not found");

        if (dto.Content != null) question.Content = dto.Content;
        if (dto.Point.HasValue) question.Point = dto.Point.Value;
        if (dto.OrderIndex.HasValue) question.OrderIndex = dto.OrderIndex.Value;

        await context.SaveChangesAsync();

        var updated = await context.QuizQuestions
            .AsNoTracking()
            .Include(q => q.Options.OrderBy(o => o.OrderIndex))
            .FirstAsync(q => q.Id == questionId);

        return MapToQuestionDto(updated);
    }

    public async Task<Result<bool>> DeleteQuestionAsync(Guid quizId, Guid questionId, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<bool>.NotFound("Quiz not found");

        var question = await context.QuizQuestions
            .FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);

        if (question == null)
            return Result<bool>.NotFound("Question not found");

        context.QuizQuestions.Remove(question);
        await context.SaveChangesAsync();

        return true;
    }

    // ─── Option CRUD ─────────────────────────────────────────────────────────────

    public async Task<Result<OptionResponseDto>> AddOptionAsync(Guid quizId, Guid questionId, CreateOptionDto dto, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<OptionResponseDto>.NotFound("Quiz not found");

        var question = await context.QuizQuestions
            .FirstOrDefaultAsync(q => q.Id == questionId && q.QuizId == quizId);

        if (question == null)
            return Result<OptionResponseDto>.NotFound("Question not found");

        var option = new QuizOption
        {
            Id = Guid.NewGuid(),
            QuestionId = questionId,
            Content = dto.Content,
            IsCorrect = dto.IsCorrect,
            OrderIndex = dto.OrderIndex
        };

        context.QuizOptions.Add(option);
        await context.SaveChangesAsync();

        return new OptionResponseDto(option.Id, option.Content, option.IsCorrect, option.OrderIndex);
    }

    public async Task<Result<OptionResponseDto>> UpdateOptionAsync(Guid quizId, Guid questionId, Guid optionId, UpdateOptionDto dto, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<OptionResponseDto>.NotFound("Quiz not found");

        var option = await context.QuizOptions
            .Include(o => o.Question)
            .FirstOrDefaultAsync(o => o.Id == optionId && o.QuestionId == questionId && o.Question.QuizId == quizId);

        if (option == null)
            return Result<OptionResponseDto>.NotFound("Option not found");

        if (dto.Content != null) option.Content = dto.Content;
        if (dto.IsCorrect.HasValue) option.IsCorrect = dto.IsCorrect.Value;
        if (dto.OrderIndex.HasValue) option.OrderIndex = dto.OrderIndex.Value;

        await context.SaveChangesAsync();

        return new OptionResponseDto(option.Id, option.Content, option.IsCorrect, option.OrderIndex);
    }

    public async Task<Result<bool>> DeleteOptionAsync(Guid quizId, Guid questionId, Guid optionId, Guid actorId)
    {
        var quiz = await GetQuizForActorAsync(quizId, actorId);
        if (quiz == null)
            return Result<bool>.NotFound("Quiz not found");

        var option = await context.QuizOptions
            .Include(o => o.Question)
            .FirstOrDefaultAsync(o => o.Id == optionId && o.QuestionId == questionId && o.Question.QuizId == quizId);

        if (option == null)
            return Result<bool>.NotFound("Option not found");

        context.QuizOptions.Remove(option);
        await context.SaveChangesAsync();

        return true;
    }

    // ─── Quiz Taking ────────────────────────────────────────────────────────────

    public async Task<Result<QuizForTakingDto>> GetQuizForTakingAsync(Guid quizId, Guid userId)
    {
        var quiz = await context.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions.Where(qn => !qn.Quiz.IsDeleted))
                .ThenInclude(q => q.Options.OrderBy(o => o.OrderIndex))
            .FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);

        if (quiz == null)
            return Result<QuizForTakingDto>.NotFound("Quiz not found");

        // Check enrollment
        var isEnrolled = await context.Enrollments
            .AnyAsync(e => e.CourseId == quiz.CourseId && e.UserId == userId);

        if (!isEnrolled)
            return Result<QuizForTakingDto>.Forbidden("You must be enrolled to take this quiz");

        return new QuizForTakingDto(
            quiz.Id,
            quiz.CourseId,
            quiz.Title,
            quiz.Description,
            quiz.PassingScore,
            quiz.TimeLimitMinutes,
            quiz.MaxAttempts,
            quiz.IsFinalQuiz,
            quiz.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(q => new QuestionForTakingDto(
                    q.Id,
                    q.Content,
                    q.Point,
                    q.OrderIndex,
                    q.Options.Select(o => new OptionForTakingDto(o.Id, o.Content, o.OrderIndex)).ToList()
                )).ToList(),
            quiz.CreatedAt
        );
    }

    public async Task<Result<Guid>> StartAttemptAsync(Guid quizId, Guid userId)
    {
        var quiz = await context.Quizzes
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);

        if (quiz == null)
            return Result<Guid>.NotFound("Quiz not found");

        // Check enrollment
        var isEnrolled = await context.Enrollments
            .AnyAsync(e => e.CourseId == quiz.CourseId && e.UserId == userId);

        if (!isEnrolled)
            return Result<Guid>.Forbidden("You must be enrolled to take this quiz");

        // Check max attempts
        var attemptCount = await context.QuizAttempts
            .CountAsync(a => a.QuizId == quizId && a.UserId == userId);

        if (attemptCount >= quiz.MaxAttempts)
            return Result<Guid>.Failure(
                $"You have reached the maximum number of attempts ({quiz.MaxAttempts})",
                ErrorType.Forbidden);

        // Check for in-progress attempt (not yet submitted)
        var inProgress = await context.QuizAttempts
            .AnyAsync(a => a.QuizId == quizId && a.UserId == userId && a.SubmittedAt == null);

        if (inProgress)
            return Result<Guid>.Failure("You already have an in-progress attempt", ErrorType.Conflict);

        var attempt = new QuizAttempt
        {
            Id = Guid.NewGuid(),
            QuizId = quizId,
            UserId = userId,
            Score = 0,
            IsPassed = false,
            StartedAt = DateTime.UtcNow
        };

        context.QuizAttempts.Add(attempt);
        await context.SaveChangesAsync();

        return attempt.Id;
    }

    public async Task<Result<QuizAttemptResultDto>> SubmitAttemptAsync(Guid attemptId, List<SubmitAnswerDto> answers, Guid userId)
    {
        var attempt = await context.QuizAttempts
            .Include(a => a.Quiz)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId);

        if (attempt == null)
            return Result<QuizAttemptResultDto>.NotFound("Attempt not found");

        if (attempt.SubmittedAt != null)
            return Result<QuizAttemptResultDto>.Failure("This attempt has already been submitted", ErrorType.Conflict);

        // Check time limit
        if (attempt.Quiz.TimeLimitMinutes.HasValue)
        {
            var elapsed = DateTime.UtcNow - attempt.StartedAt;
            if (elapsed.TotalMinutes > attempt.Quiz.TimeLimitMinutes.Value)
                return Result<QuizAttemptResultDto>.Failure("Time limit exceeded", ErrorType.Forbidden);
        }

        // Get all questions for this quiz with correct options
        var quizId = attempt.QuizId;
        var questions = await context.QuizQuestions
            .AsNoTracking()
            .Include(q => q.Options)
            .Where(q => q.QuizId == quizId)
            .ToListAsync();

        decimal totalPoints = questions.Sum(q => q.Point);
        decimal earnedPoints = 0;
        var answerResults = new List<AnswerResultDto>();
        var savedAnswers = new List<QuizAttemptAnswer>();

        foreach (var answer in answers)
        {
            var question = questions.FirstOrDefault(q => q.Id == answer.QuestionId);
            if (question == null) continue;

            var selectedOption = question.Options.FirstOrDefault(o => o.Id == answer.SelectedOptionId);
            var correctOption = question.Options.FirstOrDefault(o => o.IsCorrect);

            var isCorrect = selectedOption?.IsCorrect ?? false;

            if (isCorrect)
                earnedPoints += question.Point;

            savedAnswers.Add(new QuizAttemptAnswer
            {
                Id = Guid.NewGuid(),
                AttemptId = attemptId,
                QuestionId = answer.QuestionId,
                SelectedOptionId = answer.SelectedOptionId,
                IsCorrect = isCorrect
            });

            answerResults.Add(new AnswerResultDto(
                answer.QuestionId,
                question.Content,
                answer.SelectedOptionId,
                selectedOption?.Content ?? "",
                isCorrect,
                correctOption?.Id,
                correctOption?.Content
            ));
        }

        context.QuizAttemptAnswers.AddRange(savedAnswers);

        attempt.Score = totalPoints > 0 ? Math.Round(earnedPoints / totalPoints * 100, 2) : 0;
        attempt.IsPassed = attempt.Score >= attempt.Quiz.PassingScore;
        attempt.SubmittedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new QuizAttemptResultDto(
            attempt.Id,
            attempt.QuizId,
            attempt.Quiz.Title,
            attempt.Score,
            attempt.IsPassed,
            attempt.StartedAt,
            attempt.SubmittedAt,
            answerResults
        );
    }

    public async Task<Result<List<QuizAttemptSummaryDto>>> GetUserAttemptsAsync(Guid quizId, Guid userId)
    {
        var quiz = await context.Quizzes.AsNoTracking().FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);
        if (quiz == null)
            return Result<List<QuizAttemptSummaryDto>>.NotFound("Quiz not found");

        var attempts = await context.QuizAttempts
            .AsNoTracking()
            .Where(a => a.QuizId == quizId && a.UserId == userId)
            .OrderByDescending(a => a.StartedAt)
            .ToListAsync();

        return attempts.Select(a => new QuizAttemptSummaryDto(
            a.Id,
            a.QuizId,
            quiz.Title,
            a.Score,
            a.IsPassed,
            a.StartedAt,
            a.SubmittedAt
        )).ToList();
    }

    public async Task<Result<QuizAttemptResultDto>> GetAttemptResultAsync(Guid attemptId, Guid userId)
    {
        var attempt = await context.QuizAttempts
            .AsNoTracking()
            .Include(a => a.Quiz)
            .FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId);

        if (attempt == null)
            return Result<QuizAttemptResultDto>.NotFound("Attempt not found");

        var answers = await context.QuizAttemptAnswers
            .AsNoTracking()
            .Include(a => a.Question)
            .Include(a => a.SelectedOption)
            .Where(a => a.AttemptId == attemptId)
            .ToListAsync();

        var questionIds = answers.Select(a => a.QuestionId).ToList();
        var correctOptions = await context.QuizOptions
            .AsNoTracking()
            .Where(o => questionIds.Contains(o.QuestionId) && o.IsCorrect)
            .ToListAsync();

        var answerResults = answers.Select(a =>
        {
            var correct = correctOptions.FirstOrDefault(o => o.QuestionId == a.QuestionId);
            return new AnswerResultDto(
                a.QuestionId,
                a.Question.Content,
                a.SelectedOptionId,
                a.SelectedOption.Content,
                a.IsCorrect,
                correct?.Id,
                correct?.Content
            );
        }).ToList();

        return new QuizAttemptResultDto(
            attempt.Id,
            attempt.QuizId,
            attempt.Quiz.Title,
            attempt.Score,
            attempt.IsPassed,
            attempt.StartedAt,
            attempt.SubmittedAt,
            answerResults
        );
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private async Task<Quiz?> GetQuizForActorAsync(Guid quizId, Guid actorId)
    {
        var quiz = await context.Quizzes.FirstOrDefaultAsync(q => q.Id == quizId && !q.IsDeleted);
        if (quiz == null) return null;

        var course = await context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.Id == quiz.CourseId);
        if (course == null || course.InstructorId != actorId)
            return null;

        return quiz;
    }

    private static QuizResponseDto MapToResponseDto(Quiz quiz) =>
        new(
            quiz.Id,
            quiz.CourseId,
            quiz.Title,
            quiz.Description,
            quiz.PassingScore,
            quiz.TimeLimitMinutes,
            quiz.MaxAttempts,
            quiz.IsFinalQuiz,
            quiz.Questions?.Count ?? 0,
            quiz.CreatedAt
        );

    private static QuizDetailResponseDto MapToDetailDto(Quiz quiz) =>
        new(
            quiz.Id,
            quiz.CourseId,
            quiz.Title,
            quiz.Description,
            quiz.PassingScore,
            quiz.TimeLimitMinutes,
            quiz.MaxAttempts,
            quiz.IsFinalQuiz,
            quiz.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(MapToQuestionDto)
                .ToList(),
            quiz.CreatedAt
        );

    private static QuestionResponseDto MapToQuestionDto(QuizQuestion question) =>
        new(
            question.Id,
            question.Content,
            question.Point,
            question.OrderIndex,
            question.Options
                .OrderBy(o => o.OrderIndex)
                .Select(o => new OptionResponseDto(o.Id, o.Content, o.IsCorrect, o.OrderIndex))
                .ToList()
        );
}
