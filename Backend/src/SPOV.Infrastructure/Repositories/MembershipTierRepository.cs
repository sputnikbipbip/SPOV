using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class MembershipTierRepository : IMembershipTierRepository
{
    private readonly ApplicationDbContext _db;

    public MembershipTierRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<MembershipTier>> GetAllAsync()
    {
        return await _db.MembershipTiers.ToListAsync();
    }

    public async Task<MembershipTier?> GetByIdAsync(int id)
    {
        return await _db.MembershipTiers.FindAsync(id);
    }

    public async Task<MembershipTier> AddAsync(MembershipTier tier)
    {
        _db.MembershipTiers.Add(tier);
        await _db.SaveChangesAsync();
        return tier;
    }
}
