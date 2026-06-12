namespace SkillMetrix_LMS.API.Features.Lessons;

public class LessonEntityConfig : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        // Lesson indexes
        builder.HasIndex(l => l.ChapterId);
        builder.HasIndex(l => new { l.ChapterId, l.OrderIndex });
        builder.HasIndex(l => l.IsDeleted);
        builder.HasIndex(l => l.UpdatedAt);
        builder.HasIndex(l => l.IsFreePreview);
    }
}

public class LessonDocumentEntityConfig : IEntityTypeConfiguration<LessonDocument>
{
    public void Configure(EntityTypeBuilder<LessonDocument> builder)
    {
        builder.HasIndex(d => d.LessonId);
        builder.HasIndex(d => d.OrderIndex);
        builder.HasOne(d => d.Lesson)
            .WithMany()
            .HasForeignKey(d => d.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class LessonNoteEntityConfig : IEntityTypeConfiguration<LessonNote>
{
    public void Configure(EntityTypeBuilder<LessonNote> builder)
    {
        builder.HasIndex(n => n.LessonId);
        builder.HasIndex(n => n.UserId);
        builder.HasOne(n => n.Lesson)
            .WithMany()
            .HasForeignKey(n => n.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class LessonQuestionEntityConfig : IEntityTypeConfiguration<LessonQuestion>
{
    public void Configure(EntityTypeBuilder<LessonQuestion> builder)
    {
        builder.HasIndex(q => q.LessonId);
        builder.HasOne(q => q.Lesson)
            .WithMany()
            .HasForeignKey(q => q.LessonId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(q => q.User)
            .WithMany()
            .HasForeignKey(q => q.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class LessonAnswerEntityConfig : IEntityTypeConfiguration<LessonAnswer>
{
    public void Configure(EntityTypeBuilder<LessonAnswer> builder)
    {
        builder.HasIndex(a => a.QuestionId);
        builder.HasOne(a => a.Question)
            .WithMany(q => q.Answers)
            .HasForeignKey(a => a.QuestionId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}