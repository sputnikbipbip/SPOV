using Microsoft.EntityFrameworkCore;
using SPOV.Application.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class PartnerRepository : IPartnerRepository
{
    private readonly ApplicationDbContext _db;

    public PartnerRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<Partner>> GetAllAsync(QueryFilter queryFilter, CancellationToken ct)
    {
        var pageNumber = Math.Max(1, queryFilter.PageNumber);
        var pageSize = Math.Clamp(queryFilter.PageSize, 1, 50);

        var query = _db.Partners
            .AsNoTracking()
            .Include(p => p.MembershipTier)
            .ApplySearch(queryFilter.Search)
            .ApplySort(queryFilter.SortBy);

        if (!string.IsNullOrWhiteSpace(queryFilter.MembershipStatus)
            && Enum.TryParse<MembershipStatus>(queryFilter.MembershipStatus, true, out var status))
        {
            query = query.Where(p => p.MembershipStatus == status);
        }

        var totalRecords = await query.CountAsync(ct);
        var items = await query
            .ApplyPagination(pageNumber, pageSize)
            .ToListAsync(ct);

        return new PagedResult<Partner>(items, totalRecords, pageNumber, pageSize);
    }

    public async Task<Partner?> GetByIdAsync(int id)
    {
        return await _db.Partners.Include(p => p.MembershipTier).FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Partner?> GetByUserIdAsync(string userId)
    {
        return await _db.Partners.Include(p => p.MembershipTier).FirstOrDefaultAsync(p => p.UserId == userId);
    }

    public async Task<Partner?> GetByEmailAsync(string email)
    {
        return await _db.Partners.Include(p => p.MembershipTier).FirstOrDefaultAsync(p => p.Email == email);
    }

    public async Task<Partner> AddAsync(Partner partner)
    {
        _db.Partners.Add(partner);
        await _db.SaveChangesAsync();
        return partner;
    }

    public async Task<Partner> AddWithPaymentAsync(Partner partner, Payment payment)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            _db.Partners.Add(partner);
            await _db.SaveChangesAsync();

            payment.PartnerId = partner.Id;
            _db.Payments.Add(payment);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
            return partner;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateAsync(Partner partner)
    {
        _db.Partners.Update(partner);
        await _db.SaveChangesAsync();
    }
}
