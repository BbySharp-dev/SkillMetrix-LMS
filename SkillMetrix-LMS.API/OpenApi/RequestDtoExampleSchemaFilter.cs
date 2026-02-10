using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using SkillMetrix_LMS.API.Features.Auth.DTOs;
using SkillMetrix_LMS.API.Features.Chapters.DTOs;
using SkillMetrix_LMS.API.Features.Lessons.DTOs;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SkillMetrix_LMS.API.OpenApi;

public class RequestDtoExampleSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type == typeof(LoginDto))
        {
            schema.Example = new OpenApiObject
            {
                ["email"] = new OpenApiString("instructor@skillmetrix.local"),
                ["password"] = new OpenApiString("P@ssw0rd123")
            };
            return;
        }

        if (context.Type == typeof(RegisterDto))
        {
            schema.Example = new OpenApiObject
            {
                ["fullName"] = new OpenApiString("Nguyen Van A"),
                ["email"] = new OpenApiString("student@skillmetrix.local"),
                ["password"] = new OpenApiString("P@ssw0rd123"),
                ["confirmPassword"] = new OpenApiString("P@ssw0rd123")
            };
            return;
        }

        if (context.Type == typeof(CreateChapterDto))
        {
            schema.Example = new OpenApiObject
            {
                ["title"] = new OpenApiString("Module 1 - Introduction"),
                ["description"] = new OpenApiString("Overview and setup for the course")
            };
            return;
        }

        if (context.Type == typeof(CreateLessonDto))
        {
            schema.Example = new OpenApiObject
            {
                ["title"] = new OpenApiString("Lesson 1 - Welcome"),
                ["description"] = new OpenApiString("Course orientation and roadmap"),
                ["durationSeconds"] = new OpenApiInteger(600),
                ["isFreePreview"] = new OpenApiBoolean(true)
            };
            return;
        }

        if (context.Type == typeof(UpdateLessonDto))
        {
            schema.Example = new OpenApiObject
            {
                ["title"] = new OpenApiString("Lesson 1 - Welcome (Updated)"),
                ["description"] = new OpenApiString("Updated lesson summary"),
                ["durationSeconds"] = new OpenApiInteger(720),
                ["isFreePreview"] = new OpenApiBoolean(false)
            };
        }
    }
}
