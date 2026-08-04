using SPOV.Domain.Common;

namespace SPOV.Domain.Entities;

public class Article : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } = [nameof(Title), nameof(Body)];

    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public int? RequiredTierId { get; set; }
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
}
