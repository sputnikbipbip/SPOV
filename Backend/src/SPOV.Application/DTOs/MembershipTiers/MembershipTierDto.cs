namespace SPOV.Application.DTOs.MembershipTiers;

public class MembershipTierDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string BillingInterval { get; set; } = string.Empty;
    public string? Benefits { get; set; }
}
