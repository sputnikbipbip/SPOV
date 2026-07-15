using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class PartnerRepository : IPartnerRepository
{
    private readonly ApplicationDbContext _db;

    public PartnerRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<Partner>> GetAllAsync()
    {
        return await _db.Partners.Include(p => p.MembershipTier).ToListAsync();
    }

    public async Task<Partner?> GetByIdAsync(int id)
    {
        return await _db.Partners.Include(p => p.MembershipTier).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Partner?> GetByUserIdAsync(string userId)
    {
        return await _db.Partners.Include(p => p.MembershipTier).FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<Partner> AddAsync(Partner partner)
    {
        _db.Partners.Add(partner);
        await _db.SaveChangesAsync();
        return partner;
    }

    public async Task UpdateAsync(Partner partner)
    {
        _db.Partners.Update(partner);
        await _db.SaveChangesAsync();
    }
}
