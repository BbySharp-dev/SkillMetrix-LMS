using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SkillMetrix_LMS.API.OpenApi;

/// <summary>
/// Sắp xếp mảng tags gốc của openapi theo thứ tự nghiệp vụ để thanh bên swagger ui / scalar thống nhất.
/// </summary>
public sealed class TagOrderDocumentFilter : IDocumentFilter
{
    private static readonly string[] TagOrder =
    [
        "Health", "Auth", "Courses", "Chapters", "Lessons",
        "Enrollments", "Progress", "Transactions", "Upload", "Seed"
    ];

    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var pathItem in swaggerDoc.Paths.Values)
        {
            foreach (var op in pathItem.Operations.Values)
            {
                if (op.Tags == null)
                    continue;
                foreach (var t in op.Tags)
                {
                    if (!string.IsNullOrEmpty(t.Name))
                        seen.Add(t.Name);
                }
            }
        }

        var ordered = new List<string>();
        foreach (var name in TagOrder)
        {
            if (seen.Contains(name))
                ordered.Add(name);
        }

        foreach (var name in seen.OrderBy(x => x, StringComparer.OrdinalIgnoreCase))
        {
            if (!ordered.Exists(o => string.Equals(o, name, StringComparison.OrdinalIgnoreCase)))
                ordered.Add(name);
        }

        swaggerDoc.Tags = ordered.Select(n => new OpenApiTag { Name = n }).ToList();
    }
}
