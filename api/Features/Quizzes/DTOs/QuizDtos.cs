namespace SkillMetrix_LMS.API.Features.Quizzes.DTOs;

// ─── Quiz DTOs ──────────────────────────────────────────────────────────────

public record QuizResponseDto(
    Guid Id,
    Guid CourseId,
    Guid? ChapterId,
    Guid? LessonId,
    string Title,
    string? Description,
    decimal PassingScore,
    int? TimeLimitMinutes,
    int MaxAttempts,
    bool IsFinalQuiz,
    int QuestionCount,
    DateTime CreatedAt
);

public record QuizDetailResponseDto(
    Guid Id,
    Guid CourseId,
    Guid? ChapterId,
    Guid? LessonId,
    string Title,
    string? Description,
    decimal PassingScore,
    int? TimeLimitMinutes,
    int MaxAttempts,
    bool IsFinalQuiz,
    List<QuestionResponseDto> Questions,
    DateTime CreatedAt
);

public record QuizForTakingDto(
    Guid Id,
    Guid CourseId,
    Guid? ChapterId,
    Guid? LessonId,
    string Title,
    string? Description,
    decimal PassingScore,
    int? TimeLimitMinutes,
    int MaxAttempts,
    bool IsFinalQuiz,
    List<QuestionForTakingDto> Questions,
    DateTime CreatedAt
);

// ─── Question DTOs ──────────────────────────────────────────────────────────

public record QuestionResponseDto(
    Guid Id,
    string Content,
    decimal Point,
    int OrderIndex,
    List<OptionResponseDto> Options
);

// For students taking quiz — NO correct answer
public record QuestionForTakingDto(
    Guid Id,
    string Content,
    decimal Point,
    int OrderIndex,
    List<OptionForTakingDto> Options
);

public record OptionResponseDto(
    Guid Id,
    string Content,
    bool IsCorrect,
    int OrderIndex
);

// For students — NO IsCorrect flag
public record OptionForTakingDto(
    Guid Id,
    string Content,
    int OrderIndex
);

// ─── CRUD DTOs ──────────────────────────────────────────────────────────────

public record CreateQuizDto(
    Guid CourseId,
    Guid? ChapterId,
    Guid? LessonId,
    string Title,
    string? Description,
    decimal PassingScore,
    int? TimeLimitMinutes,
    int? MaxAttempts = 3,
    bool IsFinalQuiz = false
);

public record UpdateQuizDto(
    string? Title,
    string? Description,
    decimal? PassingScore,
    int? TimeLimitMinutes,
    int? MaxAttempts,
    bool? IsFinalQuiz,
    Guid? ChapterId,
    Guid? LessonId
);

public record CreateQuestionDto(
    string Content,
    decimal Point,
    int OrderIndex,
    List<CreateOptionDto>? Options = null
);

public record UpdateQuestionDto(
    string? Content,
    decimal? Point,
    int? OrderIndex
);

public record CreateOptionDto(
    string Content,
    bool IsCorrect,
    int OrderIndex
);

public record UpdateOptionDto(
    string? Content,
    bool? IsCorrect,
    int? OrderIndex
);

// ─── Quiz Attempt DTOs ─────────────────────────────────────────────────────

public record QuizAttemptSummaryDto(
    Guid Id,
    Guid QuizId,
    string QuizTitle,
    decimal Score,
    bool IsPassed,
    DateTime StartedAt,
    DateTime? SubmittedAt
);

public record StartQuizAttemptDto;

public record SubmitAnswerDto(
    Guid QuestionId,
    Guid SelectedOptionId
);

public record QuizAttemptResultDto(
    Guid Id,
    Guid QuizId,
    string QuizTitle,
    decimal Score,
    bool IsPassed,
    DateTime StartedAt,
    DateTime? SubmittedAt,
    List<AnswerResultDto> Answers
);

public record AnswerResultDto(
    Guid QuestionId,
    string QuestionContent,
    Guid SelectedOptionId,
    string SelectedOptionContent,
    bool IsCorrect,
    Guid? CorrectOptionId,
    string? CorrectOptionContent
);