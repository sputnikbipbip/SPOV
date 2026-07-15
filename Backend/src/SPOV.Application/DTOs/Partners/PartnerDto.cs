namespace SPOV.Application.DTOs.Partners;

public class PartnerDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ClinicName { get; set; }
    public string? Specialization { get; set; }
    public string? Country { get; set; }
    public string MembershipStatus { get; set; } = string.Empty;
    public int? MembershipTierId { get; set; }
    public string? MembershipTierName { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? MembershipExpiresAt { get; set; }
}
