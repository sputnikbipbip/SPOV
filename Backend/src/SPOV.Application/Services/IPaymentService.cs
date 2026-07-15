using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IPaymentService
{
    Task<Result<List<PaymentDto>>> GetByPartnerIdAsync(int partnerId);
}
