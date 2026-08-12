using SPOV.Domain.Common;

namespace SPOV.Domain.Entities;

public class SharedDocument : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } =
        [nameof(FileName), nameof(Category)];
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? Category { get; set; }
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public string? OwnerId { get; set; }
}
