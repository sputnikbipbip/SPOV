namespace SPOV.Application.DTOs.Partners;

public class CreatePartnerResponse
{
    public PartnerProfileDto Partner { get; set; } = null!;
    public string TemporaryPassword { get; set; } = string.Empty;
}
