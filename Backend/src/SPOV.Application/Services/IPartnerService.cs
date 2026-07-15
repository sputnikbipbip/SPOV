using SPOV.Application.DTOs.Partners;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IPartnerService
{
    Task<Result<List<PartnerDto>>> GetAllAsync();
    Task<Result<PartnerDto?>> GetByIdAsync(int id);
    Task<Result<PartnerDto?>> GetByUserIdAsync(string userId);
    Task<Result<PartnerDto>> CreateAsync(string userId, string fullName);
}
