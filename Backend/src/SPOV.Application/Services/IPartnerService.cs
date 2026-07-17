using SPOV.Application.DTOs.Partners;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IPartnerService
{
    Task<Result<List<PartnerDto>>> GetAllAsync();
    Task<Result<PartnerDto?>> GetByIdAsync(int id);
    Task<Result<PartnerDto?>> GetByUserIdAsync(string userId);
    Task<Result<PartnerDto>> CreateAsync(string userId, string fullName);
    Task<Result<PartnerProfileDto>> RegisterAsync(RegisterPartnerRequest request);
    Task<Result<PartnerProfileDto>> GetProfileByUserIdAsync(string userId);
    Task<Result<string>> UploadProofAsync(int partnerId, string fileName, Stream content);
}
