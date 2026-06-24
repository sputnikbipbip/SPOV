using System.Security.Claims;
using SPOV_Backend.Models;

namespace SPOV_Backend.Services;

public interface IDocumentService
{
    Task<List<SharedDocument>> GetDocumentsAsync(ClaimsPrincipal user);
    Task<SharedDocument> UploadDocumentAsync(IFormFile file, string? category, ClaimsPrincipal user, IWebHostEnvironment env);
}