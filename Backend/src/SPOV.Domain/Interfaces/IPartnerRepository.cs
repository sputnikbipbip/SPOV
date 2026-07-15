using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IPartnerRepository
{
    Task<List<Partner>> GetAllAsync();
    Task<Partner?> GetByIdAsync(int id);
    Task<Partner?> GetByUserIdAsync(string userId);
    Task<Partner> AddAsync(Partner partner);
    Task UpdateAsync(Partner partner);
}
