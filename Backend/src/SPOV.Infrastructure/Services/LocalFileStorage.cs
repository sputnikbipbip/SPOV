using Microsoft.Extensions.Configuration;
using SPOV.Application.Common.Interfaces;

namespace SPOV.Infrastructure.Services;

public sealed class LocalFileStorage : IFileStorage
{
    private readonly string _rootPath;

    public LocalFileStorage(IConfiguration configuration)
    {
        _rootPath = configuration["FileStorage:RootPath"]
            ?? Path.Combine(AppContext.BaseDirectory, "uploads");
    }

    public async Task<StoredFile> SaveAsync(
        Stream content,
        string originalFileName,
        string contentType,
        CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var relativeDirectory = Path.Combine("payment-proofs");
        var directory = Path.Combine(_rootPath, relativeDirectory);
        Directory.CreateDirectory(directory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var relativePath = Path.Combine(relativeDirectory, fileName).Replace(Path.DirectorySeparatorChar, '/');
        var fullPath = Path.Combine(_rootPath, relativePath.Replace('/', Path.DirectorySeparatorChar));

        await using var output = File.Create(fullPath);
        await content.CopyToAsync(output, cancellationToken);

        return new StoredFile(relativePath, contentType, output.Length);
    }

    public Task<Stream?> OpenReadAsync(string storageKey, CancellationToken cancellationToken)
    {
        var normalizedKey = storageKey.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_rootPath, normalizedKey));
        var root = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;

        if (!fullPath.StartsWith(root, StringComparison.Ordinal) || !File.Exists(fullPath))
            return Task.FromResult<Stream?>(null);

        return Task.FromResult<Stream?>(File.OpenRead(fullPath));
    }

    public Task DeleteAsync(string storageKey, CancellationToken cancellationToken)
    {
        var normalizedKey = storageKey.Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_rootPath, normalizedKey));
        var root = Path.GetFullPath(_rootPath) + Path.DirectorySeparatorChar;

        if (fullPath.StartsWith(root, StringComparison.Ordinal))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
