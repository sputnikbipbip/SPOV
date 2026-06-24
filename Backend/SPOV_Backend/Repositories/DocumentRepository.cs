using Microsoft.EntityFrameworkCore;
using SPOV_Backend.Data;
using SPOV_Backend.Models;

namespace SPOV_Backend.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly ApplicationDbContext db;

    public DocumentRepository(ApplicationDbContext db)
    {
        this.db = db;
    }

    public async Task<List<SharedDocument>> GetAllAsync()
    {
        return await db.SharedDocuments.ToListAsync();
    }

    public async Task<List<SharedDocument>> GetByOwnerIdAsync(string? ownerId)
    {
        return await db.SharedDocuments.Where(d => d.OwnerId == ownerId).ToListAsync();
    }

    public async Task<SharedDocument> AddAsync(SharedDocument document)
    {
        db.SharedDocuments.Add(document);
        await db.SaveChangesAsync();
        return document;
    }
}