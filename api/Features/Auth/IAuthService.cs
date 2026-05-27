using SkillMetrix_LMS.API.Features.Auth.DTOs;

namespace SkillMetrix_LMS.API.Features.Auth;

public interface IAuthService
{

    Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto);

    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto);

    Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto);

    Task<Result> LogoutAsync(Guid userId, string refreshToken);

    Task<Result<string>> ForgotPasswordAsync(string email);

    Task<Result> ResetPasswordAsync(ResetPasswordDto dto);

    Task<Result> ConfirmEmailAsync(string userId, string token);

    Task<Result> ResendVerificationEmailAsync(string email);
}
