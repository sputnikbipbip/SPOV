using SPOV.Application.DTOs.AdminUsers;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IAdminUserService
{
    Task<Result<List<AdminUserDto>>> GetAllAsync();
    Task<Result<AdminUserDto?>> GetByUserIdAsync(string userId);
}
