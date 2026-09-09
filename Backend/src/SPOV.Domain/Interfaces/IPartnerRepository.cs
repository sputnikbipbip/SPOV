using SPOV.Domain.Entities;
using SPOV.Domain.Specifications;

namespace SPOV.Domain.Interfaces;

public interface IPartnerRepository
{
    Task<PagedResult<Partner>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Partner?> GetByIdAsync(int id);
    Task<Partner?> GetByUserIdAsync(string userId);
    Task<Partner?> GetByEmailAsync(string email);
    Task<Partner> AddAsync(Partner partner);
    Task<Partner> AddWithPaymentAsync(Partner partner, Payment payment);
    Task UpdateAsync(Partner partner);
}
