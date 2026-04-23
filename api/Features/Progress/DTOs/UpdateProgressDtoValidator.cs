using FluentValidation;

namespace SkillMetrix_LMS.API.Features.Progress.DTOs;

public class UpdateProgressDtoValidator : AbstractValidator<UpdateProgressDto>
{
    public UpdateProgressDtoValidator()
    {
        RuleFor(x => x.LastWatchedSecond)
            .GreaterThanOrEqualTo(0)
            .WithMessage("LastWatchedSecond must be >= 0");
    }
}