using System.Text.Encodings.Web;
using MailKit.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using SPOV.Infrastructure.Identity;
using SPOV.Infrastructure.Options;

namespace SPOV.Infrastructure.Emails;

public sealed class EmailSenderService : IEmailSender<ApplicationUser>
{
    private readonly EmailOptions _emailOptions;
    private readonly AppUrlOptions _appUrlOptions;
    private readonly ISmtpResourceFactory _smtpFactory;
    private readonly ILogger<EmailSenderService> _logger;

    public EmailSenderService(
        IOptions<EmailOptions> emailOptions,
        IOptions<AppUrlOptions> appUrlOptions,
        ISmtpResourceFactory smtpFactory,
        ILogger<EmailSenderService> logger)
    {
        _emailOptions = emailOptions.Value;
        _appUrlOptions = appUrlOptions.Value;
        _smtpFactory = smtpFactory;
        _logger = logger;
    }

    public string BuildResetPasswordLink(string email, string resetCode) =>
        $"{_appUrlOptions.FrontendBaseUrl.TrimEnd('/')}/partners/reset-password?email={Uri.EscapeDataString(email)}&code={Uri.EscapeDataString(resetCode)}";

    public MimeMessage BuildMessage(string recipientEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailOptions.FromName, _emailOptions.From));
        message.To.Add(MailboxAddress.Parse(recipientEmail));
        message.Subject = subject;
        message.Body = new TextPart(TextFormat.Html) { Text = htmlBody };
        return message;
    }

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode)
    {
        var link = BuildResetPasswordLink(email, resetCode);
        return SendAsync(BuildMessage(
            email,
            "Recuperação de palavra-passe — SPOV",
            BuildHtml("Recuperação de palavra-passe",
                $"Recebemos um pedido para redefinir a palavra-passe da sua conta SPOV.<br/>" +
                $"<a href=\"{HtmlEncoder.Default.Encode(link)}\">Redefinir a palavra-passe</a><br/>" +
                "Se não foi você que fez este pedido, ignore este email. O link é válido por 24 horas.")));
    }

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) =>
        SendAsync(BuildMessage(
            email,
            "Recuperação de palavra-passe — SPOV",
            BuildHtml("Recuperação de palavra-passe",
                $"Recebemos um pedido para redefinir a palavra-passe da sua conta SPOV.<br/>" +
                $"<a href=\"{HtmlEncoder.Default.Encode(resetLink)}\">Redefinir a palavra-passe</a><br/>" +
                "Se não foi você que fez este pedido, ignore este email. O link é válido por 24 horas.")));

    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) =>
        SendAsync(BuildMessage(
            email,
            "Confirmação de registo — SPOV",
            BuildHtml("Confirmação de registo",
                $"Bem-vindo à SPOV. Confirme o seu email para concluir o registo.<br/>" +
                $"<a href=\"{HtmlEncoder.Default.Encode(confirmationLink)}\">Confirmar email</a>")));

    public Task SendChangeEmailLinkAsync(ApplicationUser user, string email, string newEmail, string changeEmailLink) =>
        SendAsync(BuildMessage(
            email,
            "Confirmação de novo email — SPOV",
            BuildHtml("Confirmação de novo email",
                $"Recebemos um pedido para alterar o email da sua conta SPOV.<br/>" +
                $"<a href=\"{HtmlEncoder.Default.Encode(changeEmailLink)}\">Confirmar novo email</a>")));

    private static string BuildHtml(string heading, string body) =>
        $"<h2>{heading}</h2><p>{body}</p>";

    private async Task SendAsync(MimeMessage message, CancellationToken cancellationToken = default)
    {
        if (!_emailOptions.IsConfigured)
        {
            _logger.LogInformation(
                "Email [{Subject}] para [{Recipient}] (SMTP não configurado — email registado no log):\n{Body}",
                message.Subject,
                message.To.ToString(),
                message.HtmlBody);
            return;
        }

        await using var smtp = _smtpFactory.Create();
        try
        {
            await smtp.ConnectAsync(
                _emailOptions.SmtpHost,
                _emailOptions.SmtpPort,
                _emailOptions.EnableSsl ? SecureSocketOptions.StartTlsWhenAvailable : SecureSocketOptions.None,
                cancellationToken);
            if (!string.IsNullOrWhiteSpace(_emailOptions.SmtpUsername))
                await smtp.AuthenticateAsync(_emailOptions.SmtpUsername, _emailOptions.SmtpPassword, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Falha ao enviar email [{Subject}] para [{Recipient}].",
                message.Subject, message.To.ToString());
            throw;
        }
    }
}