using Microsoft.AspNetCore.Mvc;

namespace SkillMetrix_LMS.API.Controllers;

/// <summary>
/// Health check controller for monitoring API status.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Checks the health status of the API.
    /// </summary>
    /// <returns>
    /// Returns a health status response indicating the API is running.
    /// </returns>
    /// <response code="200">API is healthy and running normally.</response>
    [HttpGet]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { message = "SkillMetrix LMS API is running", status = "healthy" });
    }
}
