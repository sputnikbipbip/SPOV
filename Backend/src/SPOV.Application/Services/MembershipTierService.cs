using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.DTOs.MembershipTiers;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

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

    public async Task<Result<PagedResponse<MembershipTierDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var paged = await _tierRepository.GetAllAsync(queryFilter, ct);
        var items = _mapper.Map<List<MembershipTierDto>>(paged.Items);

        return Result<PagedResponse<MembershipTierDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<MembershipTierDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
    }

    public async Task<Result<MembershipTierDto?>> GetByIdAsync(int id)
    {
        var tier = await _tierRepository.GetByIdAsync(id);
        if (tier is null)
            return Result<MembershipTierDto?>.Failure(Error.NotFound($"Tier with id {id} not found."));
        return Result<MembershipTierDto?>.Success(_mapper.Map<MembershipTierDto>(tier));
    }
}
