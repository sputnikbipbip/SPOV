using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IPaymentService
{
    Task<Result<List<PaymentDto>>> GetByPartnerIdAsync(int partnerId);
    Task<Result<PaymentDto>> UploadProofAsync(
        int partnerId,
        Stream content,
        string fileName,
        string contentType,
        long length,
        CancellationToken cancellationToken);
    Task<Result> ReviewAsync(int partnerId, int paymentId, bool approved, string reviewerId, string? note);
    Task<Result<PaymentProofDownload>> GetProofAsync(int partnerId, int paymentId, CancellationToken cancellationToken);
}
