namespace SPOV.Application.DTOs.Events;

public class EventDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? CeCredits { get; set; }
    public bool IsMembersOnly { get; set; }
}

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? CeCredits { get; set; }
    public bool IsMembersOnly { get; set; }
}

public class UpdateEventRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? CeCredits { get; set; }
    public bool IsMembersOnly { get; set; }
}
