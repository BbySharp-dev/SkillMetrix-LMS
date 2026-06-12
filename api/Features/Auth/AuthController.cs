using SkillMetrix_LMS.API.Features.Auth.DTOs;

namespace SkillMetrix_LMS.API.Features.Auth;

/// <summary>
/// Quản lý các tác vụ xác thực và định danh người dùng (Authentication and Identity).
/// Cung cấp các API đăng ký, đăng nhập, quản lý phiên làm việc (Token) và bảo mật tài khoản.
/// </summary>
[Route("api/[controller]")]
public class AuthController(IAuthService authService) : BaseApiController
{
    /// <summary>
    /// Đăng ký tài khoản học viên mới.
    /// </summary>
    /// <remarks>
    /// Tạo tài khoản mới với vai trò (role) mặc định là Student.
    /// Nếu đăng ký thành công, API sẽ trả về ngay cặp AccessToken và RefreshToken để client có thể tự động đăng nhập.
    /// </remarks>
    /// <param name="dto">Thông tin đăng ký (Email, Mật khẩu, Thông tin cá nhân,...).</param>
    /// <returns>Thông tin xác thực bao gồm Token và dữ liệu người dùng cơ bản.</returns>
    /// <response code="201">Đăng ký thành công và trả về thông tin xác thực.</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ (Validation Error) hoặc Email đã tồn tại.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
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
    /// Đăng nhập vào hệ thống.
    /// </summary>
    /// <remarks>
    /// Xác thực người dùng bằng Email và Mật khẩu.
    /// Trả về AccessToken (thời hạn ngắn, VD: 15 phút) và RefreshToken (thời hạn dài, VD: 7 ngày).
    /// </remarks>
    /// <param name="dto">Thông tin đăng nhập gồm Email và Password.</param>
    /// <returns>Thông tin xác thực bao gồm Token và dữ liệu người dùng cơ bản.</returns>
    /// <response code="200">Đăng nhập thành công.</response>
    /// <response code="400">Sai email, mật khẩu hoặc tài khoản chưa được xác thực.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
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
    /// Cấp mới Access Token từ Refresh Token (Token Rotation).
    /// </summary>
    /// <remarks>
    /// Gửi RefreshToken hiện tại đang còn hạn để nhận về một cặp AccessToken + RefreshToken hoàn toàn mới.
    /// Token cũ sẽ ngay lập tức bị thu hồi (revoke) để đảm bảo bảo mật.
    /// Endpoint này không yêu cầu truyền AccessToken trong header (AllowAnonymous).
    /// </remarks>
    /// <param name="dto">Chứa Refresh Token cũ của người dùng.</param>
    /// <returns>Cặp Token mới.</returns>
    /// <response code="200">Làm mới token thành công.</response>
    /// <response code="400">Refresh Token không hợp lệ, đã hết hạn hoặc đã bị thu hồi.</response>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
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
    /// Thu hồi (Revoke) RefreshToken hiện tại dưới database. Yêu cầu request phải đính kèm AccessToken hợp lệ.
    /// Sau khi gọi API này thành công, Client có trách nhiệm xóa token lưu ở local storage / cookies.
    /// </remarks>
    /// <param name="dto">Chứa Refresh Token cần thu hồi.</param>
    /// <returns>Thông báo đăng xuất thành công.</returns>
    /// <response code="200">Đăng xuất và thu hồi token thành công.</response>
    /// <response code="400">Refresh Token không hợp lệ.</response>
    /// <response code="401">Không tìm thấy AccessToken hợp lệ trong request.</response>
    [Authorize]
    [HttpPost("logout")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenDto dto)
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
    /// Gửi yêu cầu khôi phục mật khẩu (Forgot Password).
    /// </summary>
    /// <remarks>
    /// Tạo một mã khôi phục (Reset Token) và gửi kèm hướng dẫn đặt lại mật khẩu đến Email của người dùng.
    /// (Lưu ý: Ở môi trường Dev, token có thể được trả về thẳng trong response để tiện kiểm thử).
    /// </remarks>
    /// <param name="dto">Email của tài khoản cần khôi phục mật khẩu.</param>
    /// <returns>Thông báo xác nhận gửi email.</returns>
    /// <response code="200">Yêu cầu hợp lệ, hệ thống tiến hành gửi email khôi phục.</response>
    /// <response code="400">Dữ liệu email không hợp lệ.</response>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await authService.ForgotPasswordAsync(dto.Email);
        if (!result.IsSuccess)
            return HandleError(result);

        // Token được trả về để dev test; khi tích hợp email, chỉ cần trả message
        return Ok(new ApiResponse<object>(new { resetToken = result.Value }, "Hướng dẫn đặt lại mật khẩu đã được gửi đến email."));
    }

    /// <summary>
    /// Đặt lại mật khẩu mới bằng Reset Token.
    /// </summary>
    /// <remarks>
    /// Yêu cầu cung cấp Reset Token hợp lệ (nhận được từ email forgot-password) cùng với mật khẩu mới.
    /// </remarks>
    /// <param name="dto">Thông tin bao gồm Email, Reset Token và Mật khẩu mới.</param>
    /// <returns>Thông báo đổi mật khẩu thành công.</returns>
    /// <response code="200">Đặt lại mật khẩu thành công.</response>
    /// <response code="400">Token không hợp lệ, đã hết hạn hoặc mật khẩu không đạt yêu cầu.</response>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await authService.ResetPasswordAsync(dto);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object>(null!, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới."));
    }

    /// <summary>
    /// Xác thực địa chỉ Email của tài khoản đăng ký mới.
    /// </summary>
    /// <remarks>
    /// Kích hoạt tài khoản người dùng bằng cách cung cấp UserID và mã Token xác thực nhận được qua Email.
    /// </remarks>
    /// <param name="dto">Chứa UserID và Token xác thực.</param>
    /// <returns>Thông báo xác thực email thành công.</returns>
    /// <response code="200">Tài khoản được kích hoạt thành công.</response>
    /// <response code="400">Token xác thực không hợp lệ hoặc tài khoản đã được xác thực trước đó.</response>
    [HttpPost("confirm-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
    {
        var result = await authService.ConfirmEmailAsync(dto.UserId, dto.Token);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object>(null!, "Xác thực email thành công! Bạn có thể đăng nhập ngay."));
    }

    /// <summary>
    /// Yêu cầu gửi lại Email xác thực tài khoản.
    /// </summary>
    /// <remarks>
    /// Dùng trong trường hợp người dùng không nhận được email xác thực lần đầu, hoặc token cũ đã hết hạn.
    /// </remarks>
    /// <param name="dto">Email của tài khoản cần gửi lại mã xác thực.</param>
    /// <returns>Thông báo đã gửi lại email.</returns>
    /// <response code="200">Hệ thống đã gửi lại email xác thực.</response>
    /// <response code="400">Tài khoản không tồn tại hoặc đã được xác thực rồi.</response>
    [HttpPost("resend-verification")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationDto dto)
    {
        var result = await authService.ResendVerificationEmailAsync(dto.Email);
        if (!result.IsSuccess)
            return HandleError(result);

        return Ok(new ApiResponse<object>(null!, "Email xác thực đã được gửi lại."));
    }
}