using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public interface IDocumentRepository
{
    Task<List<SharedDocument>> GetAllAsync();
    Task<List<SharedDocument>> GetByOwnerIdAsync(string? ownerId);
    Task<SharedDocument> AddAsync(SharedDocument document);
}