using SPOV.Application.Common;
using SPOV.Application.DTOs.MembershipTiers;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface IMembershipTierService
{
    Task<Result<PagedResponse<MembershipTierDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Result<MembershipTierDto?>> GetByIdAsync(int id);
}
