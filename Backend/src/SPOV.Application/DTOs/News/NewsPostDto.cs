namespace SPOV.Application.DTOs.News;

public class NewsPostDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
    public string? AuthorId { get; set; }
}
