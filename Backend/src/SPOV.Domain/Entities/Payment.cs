namespace SPOV.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int PartnerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public string Status { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string? ProviderTransactionId { get; set; }
    public string? ProofStorageKey { get; set; }
    public string? ProofFileName { get; set; }
    public string? ProofContentType { get; set; }
    public DateTime? ProofUploadedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedByUserId { get; set; }
    public string? ReviewNote { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
