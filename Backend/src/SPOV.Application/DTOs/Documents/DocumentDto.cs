namespace SPOV.Application.DTOs.Documents;

public class DocumentDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateTime UploadDate { get; set; }
    public string? OwnerId { get; set; }
}
