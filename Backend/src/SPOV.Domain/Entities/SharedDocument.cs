namespace SPOV.Domain.Entities;

public class SharedDocument
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public string? OwnerId { get; set; }
}
