using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace SPOV.Infrastructure.Emails;

public interface ISmtpResource : IAsyncDisposable
{
    Task ConnectAsync(string host, int port, SecureSocketOptions options, CancellationToken cancellationToken);
    Task AuthenticateAsync(string username, string password, CancellationToken cancellationToken);
    Task SendAsync(MimeMessage message, CancellationToken cancellationToken);
    Task DisconnectAsync(bool quit, CancellationToken cancellationToken);
}

public interface ISmtpResourceFactory
{
    ISmtpResource Create();
}

public sealed class MailKitSmtpResource : ISmtpResource
{
    private readonly SmtpClient _client = new();

    public Task ConnectAsync(string host, int port, SecureSocketOptions options, CancellationToken cancellationToken) =>
        _client.ConnectAsync(host, port, options, cancellationToken);

    public Task AuthenticateAsync(string username, string password, CancellationToken cancellationToken) =>
        _client.AuthenticateAsync(username, password, cancellationToken);

    public Task SendAsync(MimeMessage message, CancellationToken cancellationToken) =>
        _client.SendAsync(message, cancellationToken);

    public Task DisconnectAsync(bool quit, CancellationToken cancellationToken) =>
        _client.DisconnectAsync(quit, cancellationToken);

    public ValueTask DisposeAsync()
    {
        _client.Dispose();
        return ValueTask.CompletedTask;
    }
}

public sealed class MailKitSmtpResourceFactory : ISmtpResourceFactory
{
    public ISmtpResource Create() => new MailKitSmtpResource();
}