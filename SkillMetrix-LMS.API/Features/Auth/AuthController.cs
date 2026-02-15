using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillMetrix_LMS.API.Features.Auth.DTOs;

namespace SkillMetrix_LMS.API.Features.Auth;

[Route("api/[controller]")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng ký tài khoản mới.
    /// </summary>
    /// <remarks>
    /// Tạo tài khoản mới với role mặc định là Student.
    /// Trả về AccessToken + RefreshToken để client có thể đăng nhập ngay.
    /// </remarks>
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // FluentValidation tự động validate (RegisterDtoValidator)
        // Nếu invalid → trả về 400 Bad Request trước khi vào đây

        var result = await _authService.RegisterAsync(dto);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        // 201 Created — vừa tạo resource mới (User)
        return StatusCode(201, new ApiResponse<AuthResponseDto>(
            result.Value!,
            "Registration successful"
        ));
    }

    /// <summary>
    /// Đăng nhập hệ thống.
    /// </summary>
    /// <remarks>
    /// Xác thực bằng email + password.
    /// Trả về AccessToken (15 phút) + RefreshToken (7 ngày).
    /// </remarks>
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<AuthResponseDto>(
            result.Value!,
            "Login successful"
        ));
    }

    /// <summary>
    /// Cấp mới access token từ refresh token.
    /// </summary>
    /// <remarks>
    /// Gửi RefreshToken hiện tại để nhận cặp AccessToken + RefreshToken mới.
    /// Token cũ sẽ bị revoke (Token Rotation).
    /// Không cần Authorization header.
    /// </remarks>
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken(RefreshTokenDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<AuthResponseDto>(
            result.Value!,
            "Token refreshed successfully"
        ));
    }

    /// <summary>
    /// Đăng xuất khỏi hệ thống.
    /// </summary>
    /// <remarks>
    /// Revoke RefreshToken hiện tại. Yêu cầu đã đăng nhập (có AccessToken).
    /// Client nên xóa token ở local storage sau khi gọi API này.
    /// </remarks>
    [Authorize]  // Yêu cầu đã đăng nhập
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshTokenDto dto)
    {
        // Lấy userId từ JWT claims
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await _authService.LogoutAsync(userId, dto.RefreshToken);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object>(null!, "Logout successful"));
    }
}