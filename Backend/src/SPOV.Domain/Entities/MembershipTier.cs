using SPOV.Domain.Enums;

namespace SPOV.Domain.Entities;

public class MembershipTier
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public BillingInterval BillingInterval { get; set; }
    public string? Benefits { get; set; }
}
