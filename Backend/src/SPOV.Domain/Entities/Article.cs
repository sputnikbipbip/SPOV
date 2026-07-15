namespace SPOV.Domain.Entities;

public class Article
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public int? RequiredTierId { get; set; }
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
}
