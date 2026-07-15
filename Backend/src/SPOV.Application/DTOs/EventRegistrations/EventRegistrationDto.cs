namespace SPOV.Application.DTOs.EventRegistrations;

public class EventRegistrationDto
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int PartnerId { get; set; }
    public DateTime RegisteredAt { get; set; }
}
