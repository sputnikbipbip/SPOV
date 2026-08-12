using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface IMembershipTierRepository
{
    Task<PagedResult<MembershipTier>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<MembershipTier?> GetByIdAsync(int id);
    Task<MembershipTier> AddAsync(MembershipTier tier);
}
