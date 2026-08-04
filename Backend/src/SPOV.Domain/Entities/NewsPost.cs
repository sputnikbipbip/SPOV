using SPOV.Domain.Common;

namespace SPOV.Domain.Entities;

public class NewsPost : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } = [nameof(Title), nameof(Body)];

    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public bool IsMembersOnly { get; set; }
    public string? AuthorId { get; set; }
}
