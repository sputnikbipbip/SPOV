using SPOV.Application.DTOs.Payments;

namespace SPOV.Application.DTOs.Partners;

public class PartnerProfileDto
{
    public int Id { get; set; }
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
    public string PartnerType { get; set; } = string.Empty;
    public string MembershipStatus { get; set; } = string.Empty;
    public int? MembershipTierId { get; set; }
    public string? MembershipTierName { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime? MembershipExpiresAt { get; set; }
    public List<PaymentDto> Payments { get; set; } = [];
}
