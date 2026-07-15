namespace SPOV.Application.DTOs.Payments;

public class PaymentDto
{
    public int Id { get; set; }
    public int PartnerId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public string? ProviderTransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
}
