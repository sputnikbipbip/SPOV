using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class ContactRepository : IContactRepository
{
    private readonly ApplicationDbContext _db;

    public ContactRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<ContactMessage> AddAsync(ContactMessage message)
    {
        _db.ContactMessages.Add(message);
        await _db.SaveChangesAsync();
        return message;
    }
}
