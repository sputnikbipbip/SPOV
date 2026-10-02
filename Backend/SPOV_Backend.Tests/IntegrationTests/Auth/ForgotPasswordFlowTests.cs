using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using SPOV.Infrastructure.Identity;
using Xunit;

namespace SPOV_Backend.Tests.IntegrationTests.Auth;

public sealed class ForgotPasswordFlowTests
{
    [Fact]
    public async Task ForgotPassword_Should_EmailResetCode_And_ResetPassword_Should_AllowLogin()
    {
        var spy = new SpyEmailSender();
        await using var factory = new SpyEmailApiApplicationFactory(spy);
        using var client = factory.CreateClient();

        var email = $"reset-flow-{Guid.NewGuid():N}@spov.pt";
        var registerResponse = await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Reset Flow",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });
        registerResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var forgotResponse = await client.PostAsJsonAsync("/api/auth/forgotPassword", new { email });
        forgotResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        spy.Sent.Should().ContainSingle();
        var sent = spy.Sent.Single();
        sent.Email.Should().Be(email);
        sent.Code.Should().NotBeNullOrEmpty();

        var resetResponse = await client.PostAsJsonAsync("/api/auth/resetPassword", new
        {
            email,
            resetCode = sent.Code,
            newPassword = "NewPass123!"
        });
        resetResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email,
            password = "NewPass123!"
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        body!.AccessToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task ResetPassword_WithInvalidCode_Should_ReturnBadRequest()
    {
        var spy = new SpyEmailSender();
        await using var factory = new SpyEmailApiApplicationFactory(spy);
        using var client = factory.CreateClient();

        var email = $"reset-invalid-{Guid.NewGuid():N}@spov.pt";
        await client.PostAsJsonAsync("/api/partners/register", new
        {
            fullName = "Invalid Code",
            email,
            password = "Partner123!",
            phone = "+351 900 000 000",
            partnerType = "Professional",
            initiationFee = 30m,
            quotaValue = 50m,
            totalAmount = 80m
        });

        var resetResponse = await client.PostAsJsonAsync("/api/auth/resetPassword", new
        {
            email,
            resetCode = "InVaLiD",
            newPassword = "Another123!"
        });

        resetResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    private sealed class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string TokenType { get; set; } = string.Empty;
        public int ExpiresIn { get; set; }
    }

    public sealed class SpyEmailApiApplicationFactory : ApiApplicationFactory
    {
        private readonly IEmailSender<ApplicationUser>? _sender;

        public SpyEmailApiApplicationFactory(IEmailSender<ApplicationUser>? sender = null)
        {
            _sender = sender;
        }

        protected override void ConfigureWebHostCore(IWebHostBuilder builder)
        {
            base.ConfigureWebHostCore(builder);
            if (_sender is not null)
                builder.ConfigureServices(services => services.AddSingleton<IEmailSender<ApplicationUser>>(_sender));
        }
    }

    public sealed class SpyEmailSender : IEmailSender<ApplicationUser>
    {
        public List<ResetCodeSent> Sent { get; } = [];

        public Task SendConfirmationLinkAsync(
            ApplicationUser user,
            string email,
            string confirmationLink) => Task.CompletedTask;

        public Task SendPasswordResetCodeAsync(
            ApplicationUser user,
            string email,
            string resetCode)
        {
            Sent.Add(new ResetCodeSent(email, resetCode));
            return Task.CompletedTask;
        }

        public Task SendPasswordResetLinkAsync(
            ApplicationUser user,
            string email,
            string resetLink) => Task.CompletedTask;

        public Task SendChangeEmailLinkAsync(
            ApplicationUser user,
            string email,
            string newEmail,
            string changeEmailLink) => Task.CompletedTask;

        public sealed record ResetCodeSent(string Email, string Code);
    }
}