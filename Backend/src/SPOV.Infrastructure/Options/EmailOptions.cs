namespace SPOV.Infrastructure.Options;

public sealed class EmailOptions
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string From { get; set; } = "no-reply@spov.pt";
    public string FromName { get; set; } = "SPOV";

    public bool IsConfigured => !string.IsNullOrWhiteSpace(SmtpHost);
}