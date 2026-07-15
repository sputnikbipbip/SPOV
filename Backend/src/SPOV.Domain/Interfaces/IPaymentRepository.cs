using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IPaymentRepository
{
    Task<List<Payment>> GetByPartnerIdAsync(int partnerId);
    Task<Payment> AddAsync(Payment payment);
}
