using System.Security.Claims;
using SPOV_Backend.Models;
using SPOV_Backend.Repositories;

namespace SPOV_Backend.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository documentRepository;

    public DocumentService(IDocumentRepository documentRepository)
    {
        this.documentRepository = documentRepository;
    }

    public async Task<List<SharedDocument>> GetDocumentsAsync(ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (user.IsInRole(Roles.Administrator))
            return await documentRepository.GetAllAsync();

        return await documentRepository.GetByOwnerIdAsync(userId);
    }

    public async Task<SharedDocument> UploadDocumentAsync(IFormFile file, string? category, ClaimsPrincipal user, IWebHostEnvironment env)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        var uploadsFolder = Path.Combine(env.ContentRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine("uploads", fileName);
        var fullPath = Path.Combine(env.ContentRootPath, filePath);

        using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream);

        var document = new SharedDocument
        {
            FileName = file.FileName,
            FilePath = filePath,
            Category = category,
            OwnerId = userId
        };

        return await documentRepository.AddAsync(document);
    }
}