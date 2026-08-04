using SPOV.Domain.Common;

namespace SPOV.Domain.Entities;

public class Event : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } = [nameof(Title), nameof(Description), nameof(Location)];

    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? Location { get; set; }
    public int? CeCredits { get; set; }
    public bool IsMembersOnly { get; set; }
}
