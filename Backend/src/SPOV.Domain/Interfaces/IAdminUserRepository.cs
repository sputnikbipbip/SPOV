using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IAdminUserRepository
{
    Task<List<AdminUser>> GetAllAsync();
    Task<AdminUser?> GetByUserIdAsync(string userId);
    Task<AdminUser> AddAsync(AdminUser adminUser);
}
