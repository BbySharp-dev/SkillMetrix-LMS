using FluentValidation;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;

namespace SkillMetrix_LMS.API.Features.Chapters;

public class CreateChapterDtoValidator : AbstractValidator<CreateChapterDto>
{
    public CreateChapterDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}

public class UpdateChapterDtoValidator : AbstractValidator<UpdateChapterDto>
{
    public UpdateChapterDtoValidator()
    {
        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Title));

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));
    }
}
