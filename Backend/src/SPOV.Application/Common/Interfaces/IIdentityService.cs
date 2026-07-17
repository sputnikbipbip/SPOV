namespace SPOV.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<bool> UserExistsByEmailAsync(string email);
    Task<(bool Success, string? Error, string? UserId)> CreateUserAsync(string email, string password, string fullName);
    Task<bool> AddToRoleAsync(string userId, string role);
}
