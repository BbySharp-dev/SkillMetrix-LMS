namespace SkillMetrix_LMS.API.Infrastructure.Email;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string htmlBody);
    Task SendPasswordResetEmailAsync(string to, string resetLink);
    Task SendEmailConfirmationEmailAsync(string to, string confirmationLink);
}