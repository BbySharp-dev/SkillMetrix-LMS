using FluentValidation;
using SkillMetrix_LMS.API.Features.Courses.DTOs;

namespace SkillMetrix_LMS.API.Features.Enrollments.DTOs;

public class CreateEnrollmentDtoValidation : AbstractValidator<CreateEnrollmentDto>{
    public CreateEnrollmentDtoValidation(){
        RuleFor(x => x.CourseId)
            .NotEmpty().WithMessage("CourseId is required");
    }
}

