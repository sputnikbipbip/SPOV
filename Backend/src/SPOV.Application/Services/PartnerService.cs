using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.DTOs.Partners;
using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public class PartnerService : IPartnerService
{
    private readonly IPartnerRepository _partnerRepository;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IIdentityService _identityService;
    private readonly IMapper _mapper;

    public PartnerService(
        IPartnerRepository partnerRepository,
        IPaymentRepository paymentRepository,
        IIdentityService identityService,
        IMapper mapper)
    {
        _partnerRepository = partnerRepository;
        _paymentRepository = paymentRepository;
        _identityService = identityService;
        _mapper = mapper;
    }

    public async Task<Result<PagedResponse<PartnerDto>>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var paged = await _partnerRepository.GetAllAsync(queryFilter, ct);
        var items = _mapper.Map<List<PartnerDto>>(paged.Items);

        return Result<PagedResponse<PartnerDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<PartnerDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
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

    public async Task<Result<PartnerProfileDto>> RegisterAsync(RegisterPartnerRequest request)
    {
        var existingPartner = await _partnerRepository.GetByEmailAsync(request.Email);
        if (existingPartner is not null)
            return Result<PartnerProfileDto>.Failure(Error.Conflict("Já existe um sócio registado com este email."));

        var userExists = await _identityService.UserExistsByEmailAsync(request.Email);
        if (userExists)
            return Result<PartnerProfileDto>.Failure(Error.Conflict("Já existe um utilizador com este email."));

        var (success, error, userId) = await _identityService.CreateUserAsync(
            request.Email, request.Password, request.FullName);
        if (!success)
            return Result<PartnerProfileDto>.Failure(Error.Validation(error ?? "Erro ao criar utilizador."));

        await _identityService.AddToRoleAsync(userId!, Roles.Partner);

        DateTime? birthDate = null;
        if (!string.IsNullOrWhiteSpace(request.BirthDate) && DateOnly.TryParse(request.BirthDate, out var parsed))
            birthDate = parsed.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var partner = new Partner
        {
            UserId = userId!,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            TaxId = request.TaxId,
            BirthDate = birthDate,
            Address = request.Address,
            City = request.City,
            ZipCode = request.ZipCode,
            Country = request.Country,
            AcademicQualifications = request.AcademicQualifications,
            ProfessionalCardNumber = request.ProfessionalCardNumber,
            Profession = request.Profession,
            CompanyName = request.CompanyName,
            CompanyPhone = request.CompanyPhone,
            Observations = request.Observations,
            InitiationFee = request.InitiationFee,
            QuotaValue = request.QuotaValue,
            TotalAmount = request.TotalAmount,
            PartnerType = request.PartnerType == "Student" ? PartnerType.Student : PartnerType.Professional,
            MembershipStatus = MembershipStatus.Pending,
            JoinedAt = DateTime.UtcNow
        };

        var created = await _partnerRepository.AddAsync(partner);
        var dto = _mapper.Map<PartnerProfileDto>(created);
        dto.Payments = [];

        return Result<PartnerProfileDto>.Success(dto);
    }

    public async Task<Result<PartnerDto>> ApproveAsync(int id)
    {
        var partner = await _partnerRepository.GetByIdAsync(id);
        if (partner is null)
            return Result<PartnerDto>.Failure(Error.NotFound($"Partner with id {id} not found."));

        partner.MembershipStatus = MembershipStatus.Active;
        await _partnerRepository.UpdateAsync(partner);

        return Result<PartnerDto>.Success(_mapper.Map<PartnerDto>(partner));
    }

    public async Task<Result<PartnerProfileDto>> GetProfileByUserIdAsync(string userId)
    {
        var partner = await _partnerRepository.GetByUserIdAsync(userId);
        if (partner is null)
            return Result<PartnerProfileDto>.Failure(Error.NotFound("Perfil de sócio não encontrado."));

        var dto = _mapper.Map<PartnerProfileDto>(partner);
        var payments = await _paymentRepository.GetByPartnerIdAsync(partner.Id);
        dto.Payments = _mapper.Map<List<PaymentDto>>(payments);

        return Result<PartnerProfileDto>.Success(dto);
    }

    public async Task<Result<PartnerProfileDto>> GetAdminProfileAsync(int partnerId)
    {
        var partner = await _partnerRepository.GetByIdAsync(partnerId);
        if (partner is null)
            return Result<PartnerProfileDto>.Failure(Error.NotFound("Perfil de sócio não encontrado."));

        var dto = _mapper.Map<PartnerProfileDto>(partner);
        var payments = await _paymentRepository.GetByPartnerIdAsync(partner.Id);
        dto.Payments = _mapper.Map<List<PaymentDto>>(payments);

        return Result<PartnerProfileDto>.Success(dto);
    }

    public async Task<Result<PartnerProfileDto>> UpdateProfileAsync(string userId, UpdatePartnerProfileRequest request)
    {
        var partner = await _partnerRepository.GetByUserIdAsync(userId);
        if (partner is null)
            return Result<PartnerProfileDto>.Failure(Error.NotFound("Perfil de sócio não encontrado."));

        partner.FullName = request.FullName;
        partner.Phone = request.Phone;
        partner.TaxId = request.TaxId;
        partner.Address = request.Address;
        partner.City = request.City;
        partner.ZipCode = request.ZipCode;
        partner.Country = request.Country;
        partner.AcademicQualifications = request.AcademicQualifications;
        partner.ProfessionalCardNumber = request.ProfessionalCardNumber;
        partner.Profession = request.Profession;
        partner.CompanyName = request.CompanyName;
        partner.CompanyPhone = request.CompanyPhone;
        partner.Observations = request.Observations;

        if (!string.IsNullOrWhiteSpace(request.BirthDate) && DateOnly.TryParse(request.BirthDate, out var parsed))
            partner.BirthDate = parsed.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        await _partnerRepository.UpdateAsync(partner);

        var dto = _mapper.Map<PartnerProfileDto>(partner);
        var payments = await _paymentRepository.GetByPartnerIdAsync(partner.Id);
        dto.Payments = _mapper.Map<List<PaymentDto>>(payments);

        return Result<PartnerProfileDto>.Success(dto);
    }

}
