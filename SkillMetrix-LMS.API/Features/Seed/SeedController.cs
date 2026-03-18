using Microsoft.AspNetCore.Mvc;


namespace SkillMetrix_LMS.API.Features.Seed;

[Route("api/[controller]")]
public class SeedController : BaseApiController
{
    [HttpPost]
    public IActionResult Seed()
    {
        return Ok(new ApiResponse<string>("Seed executed"));
    }
}
