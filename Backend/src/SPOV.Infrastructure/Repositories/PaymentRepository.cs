using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Common;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;
using SPOV.Infrastructure.Data;

namespace SPOV.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly ApplicationDbContext _db;

    public PaymentRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<Payment>> GetByPartnerIdAsync(int partnerId)
    {
        return await _db.Payments.Where(p => p.PartnerId == partnerId).OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<Payment?> GetByIdAsync(int id)
    {
        return await _db.Payments.FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Payment?> GetLatestOpenByPartnerIdAsync(int partnerId)
    {
        return await _db.Payments
            .Where(p => p.PartnerId == partnerId && (p.Status == PaymentStatus.Pending || p.Status == PaymentStatus.Rejected))
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<Payment> AddAsync(Payment payment)
    {
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return payment;
    }

    public async Task UpdateAsync(Payment payment)
    {
        _db.Payments.Update(payment);
        payment.Version = Guid.NewGuid();
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConcurrencyConflictException("O pagamento foi alterado por outro utilizador.");
        }
    }

    public async Task ReviewAsync(Payment payment, Partner partner, bool activatePartner)
    {
        _db.Payments.Update(payment);
        // The partner was loaded by the same DbContext; only its changed status is tracked.

        payment.Version = Guid.NewGuid();
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConcurrencyConflictException("O pagamento foi alterado por outro utilizador.");
        }
    }
}
