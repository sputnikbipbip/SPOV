using System.ComponentModel.DataAnnotations;

namespace SPOV.Application.DTOs.Payments;

public sealed class RejectPaymentRequest
{
    [MaxLength(1000)]
    public string? Note { get; set; }
}
