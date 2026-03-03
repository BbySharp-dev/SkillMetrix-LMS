using FluentValidation;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;

namespace SkillMetrix_LMS.API.Features.Lessons;

public class CreateLessonDtoValidator : AbstractValidator<CreateLessonDto>
{
    public CreateLessonDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title cannot exeed 200 characters");

        RuleFor(x => x.DurationSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Duration must be >= 0");
    }
}

public class UpdateLessonDtoValidator : AbstractValidator<UpdateLessonDto>
{
    public UpdateLessonDtoValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .When(x => x.Title != null);

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters")
            .When(x => x.Description != null);

        RuleFor(x => x.DurationSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Duration must be >= 0")
            .When(x => x.DurationSeconds.HasValue);
    }
}
