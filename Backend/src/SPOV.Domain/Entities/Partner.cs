using SPOV.Domain.Common;
using SPOV.Domain.Enums;

namespace SPOV.Domain.Entities;

public class Partner : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } =
        [nameof(FullName), nameof(Email), nameof(Phone), nameof(TaxId), nameof(City), nameof(Country), nameof(Profession), nameof(CompanyName)];

    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? ZipCode { get; set; }
    public string? Country { get; set; }
    public string? AcademicQualifications { get; set; }
    public string? ProfessionalCardNumber { get; set; }
    public string? Profession { get; set; }
    public string? CompanyName { get; set; }
    public string? CompanyPhone { get; set; }
    public string? Observations { get; set; }
    public string? PaymentProofUrl { get; set; }
    public decimal InitiationFee { get; set; }
    public decimal QuotaValue { get; set; }
    public decimal TotalAmount { get; set; }
    public PartnerType PartnerType { get; set; }
    public MembershipStatus MembershipStatus { get; set; } = MembershipStatus.Pending;
    public int? MembershipTierId { get; set; }
    public MembershipTier? MembershipTier { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? MembershipExpiresAt { get; set; }
}
