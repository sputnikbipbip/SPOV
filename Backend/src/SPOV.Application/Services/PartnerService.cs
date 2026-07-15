using AutoMapper;
using SPOV.Application.DTOs.Partners;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class PartnerService : IPartnerService
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly IMapper _mapper;

    public PartnerService(IPartnerRepository partnerRepository, IMapper mapper)
    {
        _partnerRepository = partnerRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<PartnerDto>>> GetAllAsync()
    {
        var partners = await _partnerRepository.GetAllAsync();
        return Result<List<PartnerDto>>.Success(_mapper.Map<List<PartnerDto>>(partners));
    }

    public async Task<Result<PartnerDto?>> GetByIdAsync(int id)
    {
        var partner = await _partnerRepository.GetByIdAsync(id);
        if (partner is null)
            return Result<PartnerDto?>.Failure(Error.NotFound($"Partner with id {id} not found."));
        return Result<PartnerDto?>.Success(_mapper.Map<PartnerDto>(partner));
    }

    public async Task<Result<PartnerDto?>> GetByUserIdAsync(string userId)
    {
        var partner = await _partnerRepository.GetByUserIdAsync(userId);
        return Result<PartnerDto?>.Success(_mapper.Map<PartnerDto?>(partner));
    }

    public async Task<Result<PartnerDto>> CreateAsync(string userId, string fullName)
    {
        var partner = new Partner
        {
            UserId = userId,
            FullName = fullName,
            JoinedAt = DateTime.UtcNow
        };

        var created = await _partnerRepository.AddAsync(partner);
        return Result<PartnerDto>.Success(_mapper.Map<PartnerDto>(created));
    }
}
