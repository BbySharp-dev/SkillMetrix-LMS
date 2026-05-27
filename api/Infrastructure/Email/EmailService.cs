using System.Net;
using System.Net.Mail;
using System.Text;

namespace SkillMetrix_LMS.API.Infrastructure.Email;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private bool IsDevelopment => string.Equals(
        _configuration["ASPNETCORE_ENVIRONMENT"],
        "Development",
        StringComparison.OrdinalIgnoreCase);

    private string GetFromAddress() =>
        _configuration["Email:FromAddress"] ?? "noreply@skillmetrix.com";

    private string GetFromName() =>
        _configuration["Email:FromName"] ?? "SkillMetrix LMS";

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        if (IsDevelopment)
        {
            _logger.LogInformation(
                "[DEV EMAIL] To: {To}\nSubject: {Subject}\nBody: {Body}",
                to, subject, htmlBody);
            return;
        }

        var host = _configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("SMTP Host not configured");
        var port = _configuration.GetValue<int>("Email:Smtp:Port", 587);
        var username = _configuration["Email:Smtp:Username"] ?? string.Empty;
        var password = _configuration["Email:Smtp:Password"] ?? string.Empty;
        var enableSsl = _configuration.GetValue<bool>("Email:Smtp:EnableSsl", true);

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(username, password),
            EnableSsl = enableSsl
        };

        var from = new MailAddress(GetFromAddress(), GetFromName());
        var toAddr = new MailAddress(to);
        using var message = new MailMessage(from, toAddr)
        {
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
            SubjectEncoding = Encoding.UTF8,
            BodyEncoding = Encoding.UTF8
        };

        await client.SendMailAsync(message);
        _logger.LogInformation("Email sent successfully to {To}", to);
    }

    public async Task SendPasswordResetEmailAsync(string to, string resetLink)
    {
        var subject = "Đặt lại mật khẩu - SkillMetrix LMS";
        var body = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .body {{ padding: 30px; color: #374151; }}
        .body p {{ margin: 0 0 16px; line-height: 1.6; }}
        .button {{ display: inline-block; background: #4f46e5; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }}
        .button:hover {{ background: #4338ca; }}
        .footer {{ padding: 20px 30px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 Đặt lại mật khẩu</h1>
        </div>
        <div class='body'>
            <p>Xin chào!</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản SkillMetrix LMS của bạn.</p>
            <p>Nhấn nút bên dưới để đặt lại mật khẩu:</p>
            <p style='text-align: center;'>
                <a href='{resetLink}' class='button'>Đặt lại mật khẩu</a>
            </p>
            <p>Hoặc sao chép liên kết sau vào trình duyệt:</p>
            <p style='word-break: break-all; font-size: 13px; color: #6366f1;'>{resetLink}</p>
            <div class='warning'>
                ⚠️ Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
            </div>
            <p>Trân trọng,<br><strong>Đội ngũ SkillMetrix LMS</strong></p>
        </div>
        <div class='footer'>
            Đây là email tự động từ SkillMetrix LMS. Vui lòng không trả lời email này.
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }

    public async Task SendEmailConfirmationEmailAsync(string to, string confirmationLink)
    {
        var subject = "Xác thực email - SkillMetrix LMS";
        var body = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 30px; text-align: center; color: white; }}
        .header h1 {{ margin: 0; font-size: 24px; }}
        .body {{ padding: 30px; color: #374151; }}
        .body p {{ margin: 0 0 16px; line-height: 1.6; }}
        .button {{ display: inline-block; background: #4f46e5; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }}
        .button:hover {{ background: #4338ca; }}
        .footer {{ padding: 20px 30px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; }}
        .warning {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>📧 Xác thực email</h1>
        </div>
        <div class='body'>
            <p>Xin chào!</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản SkillMetrix LMS. Vui lòng xác thực địa chỉ email của bạn bằng cách nhấn nút bên dưới:</p>
            <p style='text-align: center;'>
                <a href='{confirmationLink}' class='button'>Xác thực email</a>
            </p>
            <p>Hoặc sao chép liên kết sau vào trình duyệt:</p>
            <p style='word-break: break-all; font-size: 13px; color: #6366f1;'>{confirmationLink}</p>
            <div class='warning'>
                ⚠️ Liên kết này sẽ hết hạn sau <strong>24 giờ</strong>. Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.
            </div>
            <p>Trân trọng,<br><strong>Đội ngũ SkillMetrix LMS</strong></p>
        </div>
        <div class='footer'>
            Đây là email tự động từ SkillMetrix LMS. Vui lòng không trả lời email này.
        </div>
    </div>
</body>
</html>";

        await SendEmailAsync(to, subject, body);
    }
}
