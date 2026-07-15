using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IMembershipTierRepository
{
    Task<List<MembershipTier>> GetAllAsync();
    Task<MembershipTier?> GetByIdAsync(int id);
    Task<MembershipTier> AddAsync(MembershipTier tier);
}
