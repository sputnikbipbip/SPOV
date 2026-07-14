using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext _db;

    public DocumentRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<SharedDocument>> GetAllAsync()
    {
        return await _db.SharedDocuments.ToListAsync();
    }

    public async Task<List<SharedDocument>> GetByOwnerIdAsync(string? ownerId)
    {
        return await _db.SharedDocuments.Where(d => d.OwnerId == ownerId).ToListAsync();
    }

    public async Task<SharedDocument> AddAsync(SharedDocument document)
    {
        _db.SharedDocuments.Add(document);
        await _db.SaveChangesAsync();
        return document;
    }
}
