using SPOV.Application.Common;
using SPOV.Application.DTOs.Partners;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface IPartnerService
{
    Task<Result<PagedResponse<PartnerDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct = default);
    Task<Result<PartnerDto?>> GetByIdAsync(int id);
    Task<Result<PartnerDto?>> GetByUserIdAsync(string userId);
    Task<Result<PartnerDto>> CreateAsync(string userId, string fullName);
    Task<Result<PartnerProfileDto>> RegisterAsync(RegisterPartnerRequest request);
    Task<Result<PartnerProfileDto>> GetProfileByUserIdAsync(string userId);
    Task<Result<PartnerDto>> ApproveAsync(int id);
    Task<Result<PartnerProfileDto>> GetAdminProfileAsync(int partnerId);
    Task<Result<PartnerProfileDto>> UpdateProfileAsync(string userId, UpdatePartnerProfileRequest request);
}
