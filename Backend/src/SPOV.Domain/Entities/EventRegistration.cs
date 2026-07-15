namespace SPOV.Domain.Entities;

public class EventRegistration
{
    public int Id { get; set; }
    public int EventId { get; set; }
    public int PartnerId { get; set; }
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
}
