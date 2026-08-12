using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface IDocumentRepository
{
    Task<PagedResult<SharedDocument>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<PagedResult<SharedDocument>> GetByOwnerIdAsync(string? ownerId, QueryFilter queryFilter, CancellationToken ct = default);
    Task<SharedDocument> AddAsync(SharedDocument document);
}
