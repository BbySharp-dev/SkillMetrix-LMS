using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using SkillMetrix_LMS.API.Shared.Common;

namespace SkillMetrix_LMS.API.OpenApi;

/// <summary>
/// Swagger Operation Filter to automatically add HTTP 400 (Bad Request) response to POST, PUT, and PATCH operations.
/// </summary>
public class ValidationResponseOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var method = context.ApiDescription.HttpMethod?.ToUpper();
        if (method == "POST" || method == "PUT" || method == "PATCH")
        {
            if (!operation.Responses.ContainsKey("400"))
            {
                operation.Responses.Add("400", new OpenApiResponse
                {
                    Description = "Bad Request - Validation failure or invalid payload format",
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["application/json"] = new OpenApiMediaType
                        {
                            Schema = context.SchemaGenerator.GenerateSchema(typeof(ApiResponse<object>), context.SchemaRepository)
                        }
                    }
                });
            }
        }
    }
}
