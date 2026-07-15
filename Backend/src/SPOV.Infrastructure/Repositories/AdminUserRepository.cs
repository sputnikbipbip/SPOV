using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class AdminUserRepository : IAdminUserRepository
{
    private readonly ApplicationDbContext _db;

    public AdminUserRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<AdminUser>> GetAllAsync()
    {
        return await _db.AdminUsers.ToListAsync();
    }

    public async Task<AdminUser?> GetByUserIdAsync(string userId)
    {
        return await _db.AdminUsers.FirstOrDefaultAsync(a => a.UserId == userId);
    }

    public async Task<AdminUser> AddAsync(AdminUser adminUser)
    {
        _db.AdminUsers.Add(adminUser);
        await _db.SaveChangesAsync();
        return adminUser;
    }
}
