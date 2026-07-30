namespace SPOV.Application.DTOs.EventRegistrations;

public class PartnerRegistrationDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public DateTime RegisteredAt { get; set; }
    public string EventTitle { get; set; } = string.Empty;
    public DateTime EventStartDate { get; set; }
    public DateTime EventEndDate { get; set; }
}
