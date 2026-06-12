namespace SkillMetrix_LMS.API.Features.Quizzes;

public class QuizEntityConfig : IEntityTypeConfiguration<Quiz>
{
    public void Configure(EntityTypeBuilder<Quiz> builder)
    {
        builder.Property(q => q.PassingScore)
            .HasColumnType("decimal(5,2)");

        builder.HasIndex(q => q.CourseId);
        builder.HasIndex(q => q.ChapterId);
        builder.HasIndex(q => q.LessonId);

        builder.HasOne(q => q.Chapter)
            .WithMany()
            .HasForeignKey(q => q.ChapterId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(q => q.Lesson)
            .WithMany()
            .HasForeignKey(q => q.LessonId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class QuizQuestionEntityConfig : IEntityTypeConfiguration<QuizQuestion>
{
    public void Configure(EntityTypeBuilder<QuizQuestion> builder)
    {
        builder.Property(q => q.Point)
            .HasColumnType("decimal(5,2)");

        builder.HasIndex(q => new { q.QuizId, q.OrderIndex });
    }
}

public class QuizOptionEntityConfig : IEntityTypeConfiguration<QuizOption>
{
    public void Configure(EntityTypeBuilder<QuizOption> builder)
    {
        builder.HasIndex(o => new { o.QuestionId, o.OrderIndex });

        // Composite FK check: ensure SelectedOption belongs to Question
        builder.HasAlternateKey(o => new { o.Id, o.QuestionId });
    }
}

public class QuizAttemptEntityConfig : IEntityTypeConfiguration<QuizAttempt>
{
    public void Configure(EntityTypeBuilder<QuizAttempt> builder)
    {
        builder.Property(a => a.Score)
            .HasColumnType("decimal(5,2)");

        builder.HasIndex(a => a.QuizId);
        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.StartedAt);
    }
}

public class QuizAttemptAnswerEntityConfig : IEntityTypeConfiguration<QuizAttemptAnswer>
{
    public void Configure(EntityTypeBuilder<QuizAttemptAnswer> builder)
    {
        builder.HasIndex(a => a.AttemptId);
        builder.HasIndex(a => a.QuestionId);
        builder.HasIndex(a => new { a.AttemptId, a.QuestionId })
            .IsUnique();

        builder.HasOne(a => a.SelectedOption)
            .WithMany()
            .HasForeignKey(a => new { a.SelectedOptionId, a.QuestionId })
            .HasPrincipalKey(o => new { o.Id, o.QuestionId })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Question)
            .WithMany()
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}