using SPOV.Application.Common.Interfaces;

namespace SPOV.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly string _uploadsPath;

    public FileStorageService(string contentRootPath)
    {
        _uploadsPath = Path.Combine(contentRootPath, "uploads");
    }

    public async Task<string> SaveFileAsync(string fileName, Stream content)
    {
        if (!Directory.Exists(_uploadsPath))
            Directory.CreateDirectory(_uploadsPath);

        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var filePath = Path.Combine("uploads", uniqueName);
        var fullPath = Path.Combine(_uploadsPath, uniqueName);

        await using var stream = File.Create(fullPath);
        await content.CopyToAsync(stream);

        return filePath;
    }
}
