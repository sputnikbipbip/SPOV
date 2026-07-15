using AutoMapper;
using SPOV.Application.DTOs.MembershipTiers;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class MembershipTierService : IMembershipTierService
{
    private readonly IMembershipTierRepository _tierRepository;
    private readonly IMapper _mapper;

    public MembershipTierService(IMembershipTierRepository tierRepository, IMapper mapper)
    {
        _tierRepository = tierRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<MembershipTierDto>>> GetAllAsync()
    {
        var tiers = await _tierRepository.GetAllAsync();
        return Result<List<MembershipTierDto>>.Success(_mapper.Map<List<MembershipTierDto>>(tiers));
    }

    public async Task<Result<MembershipTierDto?>> GetByIdAsync(int id)
    {
        var tier = await _tierRepository.GetByIdAsync(id);
        if (tier is null)
            return Result<MembershipTierDto?>.Failure(Error.NotFound($"Tier with id {id} not found."));
        return Result<MembershipTierDto?>.Success(_mapper.Map<MembershipTierDto>(tier));
    }
}
