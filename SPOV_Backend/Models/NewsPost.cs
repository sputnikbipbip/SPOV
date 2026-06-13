using System.ComponentModel.DataAnnotations;

namespace SPOV_Backend.Models;

public class NewsPost
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;

    public string? AuthorId { get; set; }
    public ApplicationUser? Author { get; set; }
}
