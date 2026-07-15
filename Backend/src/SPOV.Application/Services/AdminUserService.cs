using AutoMapper;
using SPOV.Application.DTOs.AdminUsers;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IAdminUserRepository _adminUserRepository;
    private readonly IMapper _mapper;

    public AdminUserService(IAdminUserRepository adminUserRepository, IMapper mapper)
    {
        _adminUserRepository = adminUserRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<AdminUserDto>>> GetAllAsync()
    {
        var admins = await _adminUserRepository.GetAllAsync();
        return Result<List<AdminUserDto>>.Success(_mapper.Map<List<AdminUserDto>>(admins));
    }

    public async Task<Result<AdminUserDto?>> GetByUserIdAsync(string userId)
    {
        var admin = await _adminUserRepository.GetByUserIdAsync(userId);
        return Result<AdminUserDto?>.Success(_mapper.Map<AdminUserDto?>(admin));
    }
}
