using AutoMapper;
using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IMapper _mapper;

    public PaymentService(IPaymentRepository paymentRepository, IMapper mapper)
    {
        _paymentRepository = paymentRepository;
        _mapper = mapper;
    }

    public async Task<Result<List<PaymentDto>>> GetByPartnerIdAsync(int partnerId)
    {
        var payments = await _paymentRepository.GetByPartnerIdAsync(partnerId);
        return Result<List<PaymentDto>>.Success(_mapper.Map<List<PaymentDto>>(payments));
    }
}
