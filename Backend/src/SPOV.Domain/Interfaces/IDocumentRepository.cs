using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IDocumentRepository
{
    Task<List<SharedDocument>> GetAllAsync();
    Task<List<SharedDocument>> GetByOwnerIdAsync(string? ownerId);
    Task<SharedDocument> AddAsync(SharedDocument document);
}
