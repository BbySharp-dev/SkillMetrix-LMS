using SkillMetrix_LMS.API.Features.Quizzes.DTOs;

namespace SkillMetrix_LMS.API.Features.Quizzes;

public interface IQuizService
{
    // ─── Quiz CRUD (Instructor) ──────────────────────────────────────────────

    Task<Result<List<QuizResponseDto>>> GetQuizzesByCourseAsync(Guid courseId, Guid? actorId);
    Task<Result<QuizDetailResponseDto>> GetQuizByIdAsync(Guid quizId, Guid? actorId);
    Task<Result<QuizResponseDto>> CreateQuizAsync(CreateQuizDto dto, Guid actorId);
    Task<Result<QuizResponseDto>> UpdateQuizAsync(Guid quizId, UpdateQuizDto dto, Guid actorId);
    Task<Result<bool>> DeleteQuizAsync(Guid quizId, Guid actorId);

    // ─── Question CRUD ───────────────────────────────────────────────────────

    Task<Result<QuestionResponseDto>> AddQuestionAsync(Guid quizId, CreateQuestionDto dto, Guid actorId);
    Task<Result<QuestionResponseDto>> UpdateQuestionAsync(Guid quizId, Guid questionId, UpdateQuestionDto dto, Guid actorId);
    Task<Result<bool>> DeleteQuestionAsync(Guid quizId, Guid questionId, Guid actorId);

    // ─── Option CRUD ─────────────────────────────────────────────────────────

    Task<Result<OptionResponseDto>> AddOptionAsync(Guid quizId, Guid questionId, CreateOptionDto dto, Guid actorId);
    Task<Result<OptionResponseDto>> UpdateOptionAsync(Guid quizId, Guid questionId, Guid optionId, UpdateOptionDto dto, Guid actorId);
    Task<Result<bool>> DeleteOptionAsync(Guid quizId, Guid questionId, Guid optionId, Guid actorId);

    // ─── Quiz Taking (Student) ───────────────────────────────────────────────

    /// <summary>
    /// Get quiz for student to take. Returns questions WITHOUT correct answers.
    /// </summary>
    Task<Result<QuizForTakingDto>> GetQuizForTakingAsync(Guid quizId, Guid userId);

    /// <summary>
    /// Start a new quiz attempt. Returns the attempt ID.
    /// </summary>
    Task<Result<Guid>> StartAttemptAsync(Guid quizId, Guid userId);

    /// <summary>
    /// Submit answers for an attempt and calculate score.
    /// </summary>
    Task<Result<QuizAttemptResultDto>> SubmitAttemptAsync(Guid attemptId, List<SubmitAnswerDto> answers, Guid userId);

    /// <summary>
    /// Get all attempts for a quiz by a user.
    /// </summary>
    Task<Result<List<QuizAttemptSummaryDto>>> GetUserAttemptsAsync(Guid quizId, Guid userId);

    /// <summary>
    /// Get a specific attempt result (with answers revealed).
    /// </summary>
    Task<Result<QuizAttemptResultDto>> GetAttemptResultAsync(Guid attemptId, Guid userId);
}