using SPOV.Application.DTOs.MembershipTiers;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IMembershipTierService
{
    Task<Result<List<MembershipTierDto>>> GetAllAsync();
    Task<Result<MembershipTierDto?>> GetByIdAsync(int id);
}
