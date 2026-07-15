namespace SPOV.Application.DTOs.Articles;

public class ArticleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public int? RequiredTierId { get; set; }
    public DateTime PublishedAt { get; set; }
}

public class CreateArticleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? FileUrl { get; set; }
    public int? RequiredTierId { get; set; }
}
