using System.ComponentModel.DataAnnotations;

namespace SPOV_Backend.Models;

public class SharedDocument
{
    public int Id { get; set; }

    [Required]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string FilePath { get; set; } = string.Empty;

    public string? Category { get; set; }

    public DateTime UploadDate { get; set; } = DateTime.UtcNow;

    public string? OwnerId { get; set; }
    public ApplicationUser? Owner { get; set; }
}
