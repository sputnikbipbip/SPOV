using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<List<Payment>> GetByPartnerIdAsync(int partnerId);
    Task<Payment?> GetByIdAsync(int id);
    Task<Payment?> GetLatestOpenByPartnerIdAsync(int partnerId);
    Task<Payment> AddAsync(Payment payment);
    Task UpdateAsync(Payment payment);
    Task ReviewAsync(Payment payment, Partner partner, bool activatePartner);
}
