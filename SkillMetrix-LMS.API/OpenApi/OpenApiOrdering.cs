using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace SkillMetrix_LMS.API.OpenApi;

/// <summary>
/// Tạo thứ tự thao tác và nhóm ổn định cho swagger/scalar: theo domain controller, rồi theo đường dẫn và HTTP method (get → post → put → patch → delete).
/// </summary>
internal static class OpenApiOrdering
{
    internal static string ActionSortKey(ApiDescription apiDesc)
    {
        var controller = apiDesc.ActionDescriptor.RouteValues["controller"] ?? "";
        var path = apiDesc.RelativePath ?? "";
        var method = apiDesc.HttpMethod?.ToUpperInvariant() ?? "ZZZ";
        var methodRank = MethodRank(method);
        var controllerRank = ControllerDisplayRank(controller);

        if (string.Equals(controller, "Auth", StringComparison.OrdinalIgnoreCase))
        {
            var authFlow = AuthFlowOrder(path);
            return $"{controllerRank:000}_{controller}_{authFlow:000}_{path}_{methodRank}";
        }

        if (string.Equals(controller, "Seed", StringComparison.OrdinalIgnoreCase))
        {
            var seedFlow = path.EndsWith("/strict", StringComparison.OrdinalIgnoreCase) ? 10 : 20;
            return $"{controllerRank:000}_{controller}_{seedFlow:000}_{path}_{methodRank}";
        }

        return $"{controllerRank:000}_{controller}_{path}_{methodRank}";
    }

    private static int MethodRank(string method)
        => method switch
        {
            "GET" => 1,
            "POST" => 2,
            "PUT" => 3,
            "PATCH" => 4,
            "DELETE" => 5,
            _ => 6
        };

    private static int ControllerDisplayRank(string controller)
        => controller.ToLowerInvariant() switch
        {
            "health" => 10,
            "auth" => 20,
            "courses" => 30,
            "chapters" => 40,
            "lessons" => 50,
            "enrollments" => 60,
            "progress" => 70,
            "transactions" => 80,
            "upload" => 90,
            "seed" => 100,
            _ => 200
        };

    private static int AuthFlowOrder(string path)
    {
        const string prefix = "api/Auth/";
        if (path.Length <= prefix.Length || !path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            return 50;

        var sub = path[prefix.Length..].ToLowerInvariant();
        return sub switch
        {
            "register" => 10,
            "login" => 20,
            "refresh-token" => 30,
            "logout" => 40,
            _ => 50
        };
    }
}
