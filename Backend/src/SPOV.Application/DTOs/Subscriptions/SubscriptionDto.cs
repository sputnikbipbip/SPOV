namespace SPOV.Application.DTOs.Subscriptions;

public class SubscriptionDto
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
}
