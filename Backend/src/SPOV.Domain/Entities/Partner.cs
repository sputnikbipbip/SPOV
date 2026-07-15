using SPOV.Domain.Enums;

namespace SPOV.Domain.Entities;

public class Partner
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ClinicName { get; set; }
    public string? Specialization { get; set; }
    public string? Country { get; set; }
    public MembershipStatus MembershipStatus { get; set; } = MembershipStatus.Pending;
    public int? MembershipTierId { get; set; }
    public MembershipTier? MembershipTier { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? MembershipExpiresAt { get; set; }
}
