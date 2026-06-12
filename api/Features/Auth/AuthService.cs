using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using SkillMetrix_LMS.API.Features.Auth.DTOs;
using SkillMetrix_LMS.API.Infrastructure.Email;

namespace SkillMetrix_LMS.API.Features.Auth;

public class AuthService(
    UserManager<User> userManager,
    ApplicationDbContext context,
    IConfiguration configuration,
    ILogger<AuthService> logger,
    IEmailService emailService)
    : IAuthService
{
    public async Task<Result<AuthResponseDto>> RegisterAsync(RegisterDto dto)
    {
        // 1. kiểm tra email đã tồn tại hay chưa
        var existingUser = await userManager.FindByEmailAsync(dto.Email);

        if (existingUser != null)
        {
            return Result<AuthResponseDto>.Conflict("Email is already registered");
        }

        // 2. Tạo user mới với ASP.NET Identity
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            Role = UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        // 3. CreateAsync sẽ hash password và validate theo Identity rules
        var createResult = await userManager.CreateAsync(user, dto.Password);

        if (!createResult.Succeeded)
        {
            var errors = string.Join(",", createResult.Errors.Select(e => e.Description));
            return Result<AuthResponseDto>.Failure(errors, ErrorType.ValidationError);
        }

        logger.LogInformation("User registered successfully: {Email}", dto.Email);

        // 4. Tạo cặp AccessToken + RefreshToken
        var authResponse = await GenerateAuthResponseAsync(user);

        // 5. Gửi email xác thực
        var confirmToken = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmLink = $"{configuration["App:ClientUrl"] ?? "http://localhost:5173"}/verify-email?userId={user.Id}&token={Uri.EscapeDataString(confirmToken)}";
        await emailService.SendEmailConfirmationEmailAsync(user.Email!, confirmLink);

        return authResponse;
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        // 1. Tìm User bằng email
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null)
        {
            return Result<AuthResponseDto>.Failure("Invalid email or password", ErrorType.Unauthorized);
        }

        // 2. Verify password bằng Identity
        var isValidPassword = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!isValidPassword)
        {
            return Result<AuthResponseDto>.Failure("Invalid email or password", ErrorType.Unauthorized);
        }

        logger.LogInformation("User logged in: {Email}", dto.Email);

        // 3. Tạo cặp AccessToken + RefreshToken
        var authResponse = await GenerateAuthResponseAsync(user);

        return authResponse;

    }

    public async Task<Result<AuthResponseDto>> RefreshTokenAsync(RefreshTokenDto dto)
    {
        // 1. Tìm RefreshToken trong DB
        var storedToken = await context.RefreshTokens
         .Include(rt => rt.User)
         .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

        if (storedToken == null)
        {
            return Result<AuthResponseDto>.Failure("Invalid refresh token", ErrorType.Unauthorized);
        }

        // 2. Kiểm tra token đã bị revoke chưa
        if (storedToken.Revoked)
        {
            logger.LogWarning("Attempted reuse of revoked refresh token for user {UserId}", storedToken.UserId);
            return Result<AuthResponseDto>.Failure("Refresh token had been revoked", ErrorType.Unauthorized);
        }

        // 3. Kiểm tra token đã hết hạn chưa
        if (storedToken.ExpiresAt < DateTime.UtcNow)
        {
            return Result<AuthResponseDto>.Failure("Refresh token has expired", ErrorType.Unauthorized);
        }

        // 4.TOKEN ROTATION: Revoke token cũ
        storedToken.Revoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Token refresh for user {UserId}", storedToken.UserId);

        // 5. Tạo cặp token mới
        var authResponse = await GenerateAuthResponseAsync(storedToken.User);

        return authResponse;
    }

    public async Task<Result> LogoutAsync(Guid userId, string refreshToken)
    {
        // 1. Tìm và revoke RefreshToken hiện tại
        var storedToken = await context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.Token == refreshToken && !rt.Revoked);

        if (storedToken != null)
        {
            storedToken.Revoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            await context.SaveChangesAsync();
        }

        return Result.Success();
    }

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
    {
        var accessToken = GenerateAccessToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        var accessTokenExpMinutes = configuration.GetValue("Jwt:AccessTokenExpirationMinutes", 15);

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(accessTokenExpMinutes),
            User = new UserInfoDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email!,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role.ToString()
            }
        };
    }

    private string GenerateAccessToken(User user)
    {
        var secretKey = configuration["Jwt:SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = configuration["Jwt:Issuer"] ?? "SkillMetrixLMS";
        var audience = configuration["Jwt:Audience"] ?? "SkillMetrixLMS";
        var expirationMinutes = configuration.GetValue("Jwt:AccessTokenExpirationMinutes", 15);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token ID
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<string> CreateRefreshTokenAsync(Guid userId)
    {
        var expirationDays = configuration.GetValue("Jwt:RefreshTokenExpirationDays", 7);

        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var tokenString = Convert.ToBase64String(randomBytes);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(expirationDays),
            Revoked = false
        };

        context.RefreshTokens.Add(refreshToken);
        await context.SaveChangesAsync();

        return tokenString;
    }

    public async Task<Result<string>> ForgotPasswordAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            // Không tiết lộ email không tồn tại để tránh enumeration attack
            return Result<string>.Success(null!);

        var token = await userManager.GeneratePasswordResetTokenAsync(user);

        var clientUrl = configuration["App:ClientUrl"] ?? "http://localhost:5173";
        var resetLink = $"{clientUrl}/reset-password?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
        await emailService.SendPasswordResetEmailAsync(email, resetLink);

        logger.LogInformation("Password reset email sent to {Email}", email);
        return Result<string>.Success(token);
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null)
            return Result.Failure("Token không hợp lệ hoặc đã hết hạn.", ErrorType.ValidationError);

        var result = await userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result.Failure(errors, ErrorType.ValidationError);
        }

        logger.LogInformation("Password reset successfully for {Email}", dto.Email);
        return Result.Success();
    }

    public async Task<Result> ConfirmEmailAsync(string userId, string token)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
            return Result.Failure("Người dùng không tồn tại.", ErrorType.NotFound);

        if (user.EmailConfirmed)
            return Result.Failure("Email đã được xác thực trước đó.", ErrorType.BusinessRule);

        var result = await userManager.ConfirmEmailAsync(user, token);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return Result.Failure(errors, ErrorType.ValidationError);
        }

        logger.LogInformation("Email confirmed for user {UserId}", userId);
        return Result.Success();
    }

    public async Task<Result> ResendVerificationEmailAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            // Không tiết lộ email không tồn tại để tránh enumeration attack
            return Result.Success();

        if (user.EmailConfirmed)
            return Result.Failure("Email đã được xác thực trước đó.", ErrorType.BusinessRule);

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmLink = $"{configuration["App:ClientUrl"] ?? "http://localhost:5173"}/verify-email?userId={user.Id}&token={Uri.EscapeDataString(token)}";
        await emailService.SendEmailConfirmationEmailAsync(email, confirmLink);

        logger.LogInformation("Verification email resent to {Email}", email);
        return Result.Success();
    }
}