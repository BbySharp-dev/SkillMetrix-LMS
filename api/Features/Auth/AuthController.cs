using Microsoft.AspNetCore.Authorization;
using SkillMetrix_LMS.API.Features.Auth.DTOs;

namespace SkillMetrix_LMS.API.Features.Auth;

[Route("api/[controller]")]
public class AuthController(IAuthService authService) : BaseApiController
{
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

        var result = await authService.RegisterAsync(dto);

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
        var result = await authService.LoginAsync(dto);

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
        var result = await authService.RefreshTokenAsync(dto);

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
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return Unauthorized(new ApiResponse<object>("Invalid token"));
        }

        var result = await authService.LogoutAsync(userId.Value, dto.RefreshToken);

        if (!result.IsSuccess)
        {
            return HandleError(result);
        }

        return Ok(new ApiResponse<object>(null!, "Logout successful"));
    }

    /// <summary>
    /// Gửi yêu cầu đặt lại mật khẩu. Token sẽ được gửi qua email (hoặc trả về trong response ở môi trường dev).
    /// </summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await authService.ForgotPasswordAsync(dto.Email);
        if (!result.IsSuccess)
            return HandleError(result);

        // Token được trả về để dev test; khi tích hợp email, chỉ cần trả message
        return Ok(new ApiResponse<object>(new { resetToken = result.Value }, "Hướng dẫn đặt lại mật khẩu đã được gửi đến email."));
    }

    /// <summary>
    /// Đặt lại mật khẩu bằng token nhận được từ forgot-password.
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await authService.ResetPasswordAsync(dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object>(null!, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."));
    }
}