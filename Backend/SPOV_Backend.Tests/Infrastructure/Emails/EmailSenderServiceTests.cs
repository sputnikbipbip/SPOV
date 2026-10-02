using FluentAssertions;
using MailKit.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using NSubstitute;
using SPOV.Infrastructure.Emails;
using SPOV.Infrastructure.Identity;
using SPOV.Infrastructure.Options;
using Xunit;

namespace SPOV_Backend.Tests.Infrastructure.Emails;

public sealed class EmailSenderServiceTests
{
    private readonly EmailOptions _emailOptions = new();
    private readonly AppUrlOptions _appUrlOptions = new();
    private readonly ISmtpResourceFactory _smtpFactory = Substitute.For<ISmtpResourceFactory>();
    private readonly ILogger<EmailSenderService> _logger = Substitute.For<ILogger<EmailSenderService>>();

    private EmailSenderService CreateSut() => new(
        Options.Create(_emailOptions),
        Options.Create(_appUrlOptions),
        _smtpFactory,
        _logger);

    [Fact]
    public void BuildResetPasswordLink_Should_UseFrontendUrl_AndEscapeEmailAndCode()
    {
        _appUrlOptions.FrontendBaseUrl = "https://app.spov.pt/";
        var sut = CreateSut();

        var link = sut.BuildResetPasswordLink("sócio@spov.pt", "abc/def+xyz");

        link.Should().StartWith("https://app.spov.pt/partners/reset-password?email=");
        link.Should().Contain("code=abc%2Fdef%2Bxyz");
        link.Should().Contain(Uri.EscapeDataString("sócio@spov.pt"));
    }

    [Fact]
    public void BuildMessage_Should_SetSenderRecipientAndContent()
    {
        _emailOptions.From = "no-reply@spov.pt";
        _emailOptions.FromName = "SPOV";
        var sut = CreateSut();

        var message = sut.BuildMessage("partner@spov.pt", "Recuperação de palavra-passe — SPOV", "<p>Conteúdo</p>");

        message.Subject.Should().Be("Recuperação de palavra-passe — SPOV");
        message.To.Mailboxes.Should().ContainSingle(mailbox => mailbox.Address == "partner@spov.pt");
        message.From.Mailboxes.Should().ContainSingle(mailbox => mailbox.Address == "no-reply@spov.pt" && mailbox.Name == "SPOV");
        message.HtmlBody.Should().Contain("Conteúdo");
    }

    [Fact]
    public async Task SendPasswordResetCodeAsync_WithoutSmtpHost_Should_NotCallSmtp()
    {
        _emailOptions.SmtpHost = "";
        var sut = CreateSut();

        await sut.SendPasswordResetCodeAsync(new ApplicationUser(), "partner@spov.pt", "code-123");

        _smtpFactory.DidNotReceive().Create();
    }

    [Fact]
    public async Task SendPasswordResetCodeAsync_WithSmtpConfigured_Should_ConnectAuthenticateSendAndDisconnect()
    {
        _emailOptions.SmtpHost = "smtp.spov.pt";
        _emailOptions.SmtpPort = 587;
        _emailOptions.SmtpUsername = "user";
        _emailOptions.SmtpPassword = "secret";
        var smtp = Substitute.For<ISmtpResource>();
        _smtpFactory.Create().Returns(smtp);
        var sut = CreateSut();

        await sut.SendPasswordResetCodeAsync(new ApplicationUser { Email = "partner@spov.pt" }, "partner@spov.pt", "code-123");

        await smtp.Received(1).ConnectAsync("smtp.spov.pt", 587, Arg.Any<SecureSocketOptions>(), Arg.Any<CancellationToken>());
        await smtp.Received(1).AuthenticateAsync("user", "secret", Arg.Any<CancellationToken>());
        await smtp.Received(1).SendAsync(Arg.Any<MimeMessage>(), Arg.Any<CancellationToken>());
        await smtp.Received(1).DisconnectAsync(true, Arg.Any<CancellationToken>());
    }
}