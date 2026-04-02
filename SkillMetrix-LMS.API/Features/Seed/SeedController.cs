using Microsoft.AspNetCore.Mvc;

namespace SkillMetrix_LMS.API.Features.Seed;

[Route("api/dev/seed")]
public class SeedController : BaseApiController
{
    private readonly DataSeederService _dataSeederService;

    public SeedController(DataSeederService dataSeederService)
    {
        _dataSeederService = dataSeederService;
    }

    [HttpDelete("reset")]
    public async Task<IActionResult> Reset()
    {
        var result = await _dataSeederService.ResetAllDataAsync();
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object?>(null, "All data reset successfully."));
    }

    [HttpPost("strict")]
    public async Task<IActionResult> SeedStrict()
    {
        var result = await _dataSeederService.ResetAndSeedStrictAsync();
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<SeedSummaryDto>(result.Value!, "Strict relational seed completed."));
    }
}
