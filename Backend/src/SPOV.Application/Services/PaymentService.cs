using AutoMapper;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.DTOs.Payments;
using SPOV.Domain.Common;
using SPOV.Domain.Enums;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPartnerRepository _partnerRepository;
    private readonly IFileStorage _fileStorage;
    private readonly IMapper _mapper;

    public PaymentService(
        IPaymentRepository paymentRepository,
        IPartnerRepository partnerRepository,
        IFileStorage fileStorage,
        IMapper mapper)
    {
        _paymentRepository = paymentRepository;
        _partnerRepository = partnerRepository;
        _fileStorage = fileStorage;
        _mapper = mapper;
    }

    public async Task<Result<List<PaymentDto>>> GetByPartnerIdAsync(int partnerId)
    {
        var payments = await _paymentRepository.GetByPartnerIdAsync(partnerId);
        return Result<List<PaymentDto>>.Success(_mapper.Map<List<PaymentDto>>(payments));
    }

    public async Task<Result<PaymentDto>> UploadProofAsync(
        int partnerId,
        Stream content,
        string fileName,
        string contentType,
        long length,
        CancellationToken cancellationToken)
    {
        if (!IsSupportedFile(fileName, contentType, length) || !HasValidSignature(content, contentType))
            return Result<PaymentDto>.Failure(Error.Validation("O comprovativo deve ser um ficheiro PDF, JPEG ou PNG válido até 10 MB."));

        var partner = await _partnerRepository.GetByIdAsync(partnerId);
        if (partner is null)
            return Result<PaymentDto>.Failure(Error.NotFound("Perfil de sócio não encontrado."));

        var payment = await _paymentRepository.GetLatestOpenByPartnerIdAsync(partnerId);
        if (payment is null)
            return Result<PaymentDto>.Failure(Error.Conflict("Não existe nenhum pagamento pendente de comprovativo."));

        var previousStorageKey = payment.ProofStorageKey;
        var storedFile = await _fileStorage.SaveAsync(content, fileName, contentType, cancellationToken);
        payment.Status = PaymentStatus.Submitted;
        payment.ProofStorageKey = storedFile.StorageKey;
        payment.ProofFileName = SanitizeFileName(fileName);
        payment.ProofContentType = storedFile.ContentType;
        payment.ProofUploadedAt = DateTime.UtcNow;
        payment.ReviewedAt = null;
        payment.ReviewedByUserId = null;
        payment.ReviewNote = null;

        try
        {
            await _paymentRepository.UpdateAsync(payment);
        }
        catch (ConcurrencyConflictException)
        {
            await _fileStorage.DeleteAsync(storedFile.StorageKey, cancellationToken);
            return Result<PaymentDto>.Failure(Error.Conflict("O pagamento foi alterado por outro utilizador. Tente novamente."));
        }
        catch
        {
            await _fileStorage.DeleteAsync(storedFile.StorageKey, cancellationToken);
            throw;
        }

        if (!string.IsNullOrWhiteSpace(previousStorageKey))
            await _fileStorage.DeleteAsync(previousStorageKey, cancellationToken);

        return Result<PaymentDto>.Success(_mapper.Map<PaymentDto>(payment));
    }

    public async Task<Result> ReviewAsync(int partnerId, int paymentId, bool approved, string reviewerId, string? note)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment is null || payment.PartnerId != partnerId)
            return Result.Failure(Error.NotFound("Pagamento não encontrado."));

        var partner = await _partnerRepository.GetByIdAsync(partnerId);
        if (partner is null)
            return Result.Failure(Error.NotFound("Perfil de sócio não encontrado."));

        if (payment.Status != PaymentStatus.Submitted)
            return Result.Failure(Error.Conflict("Apenas comprovativos submetidos podem ser revistos."));

        payment.Status = approved ? PaymentStatus.Verified : PaymentStatus.Rejected;
        payment.ReviewedAt = DateTime.UtcNow;
        payment.ReviewedByUserId = reviewerId;
        payment.ReviewNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();

        partner.MembershipStatus = approved ? MembershipStatus.Active : partner.MembershipStatus;
        try
        {
            await _paymentRepository.ReviewAsync(payment, partner, approved);
        }
        catch (ConcurrencyConflictException)
        {
            return Result.Failure(Error.Conflict("O pagamento foi alterado por outro utilizador."));
        }

        return Result.Success();
    }

    public async Task<Result<PaymentProofDownload>> GetProofAsync(int partnerId, int paymentId, CancellationToken cancellationToken)
    {
        var payment = await _paymentRepository.GetByIdAsync(paymentId);
        if (payment is null || payment.PartnerId != partnerId || string.IsNullOrWhiteSpace(payment.ProofStorageKey))
            return Result<PaymentProofDownload>.Failure(Error.NotFound("Comprovativo não encontrado."));

        var content = await _fileStorage.OpenReadAsync(payment.ProofStorageKey, cancellationToken);
        if (content is null)
            return Result<PaymentProofDownload>.Failure(Error.NotFound("Comprovativo não encontrado."));

        return Result<PaymentProofDownload>.Success(new PaymentProofDownload(
            content,
            payment.ProofFileName ?? "comprovativo",
            payment.ProofContentType ?? "application/octet-stream"));
    }

    private static bool IsSupportedFile(string fileName, string contentType, long length)
    {
        if (length < 12 || length > 10 * 1024 * 1024)
            return false;

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return (extension, contentType.ToLowerInvariant()) switch
        {
            (".pdf", "application/pdf") => true,
            (".jpg", "image/jpeg") => true,
            (".jpeg", "image/jpeg") => true,
            (".png", "image/png") => true,
            _ => false
        };
    }

    private static string SanitizeFileName(string fileName)
    {
        var safeName = Path.GetFileName(fileName);
        var sanitized = new string(safeName.Where(character => char.IsLetterOrDigit(character) || character is '.' or '-' or '_').ToArray());
        return string.IsNullOrWhiteSpace(sanitized) ? "comprovativo" : sanitized[..Math.Min(sanitized.Length, 255)];
    }

    private static bool HasValidSignature(Stream content, string contentType)
    {
        if (!content.CanSeek)
            return false;

        var originalPosition = content.Position;
        try
        {
            content.Position = 0;
            Span<byte> signature = stackalloc byte[8];
            var read = 0;
            while (read < signature.Length)
            {
                var bytesRead = content.Read(signature[read..]);
                if (bytesRead == 0)
                    break;
                read += bytesRead;
            }
            var type = contentType.ToLowerInvariant();

            return type switch
            {
                "application/pdf" => read >= 4 && signature[..4].SequenceEqual("%PDF"u8),
                "image/jpeg" => read >= 3 && signature[0] == 0xFF && signature[1] == 0xD8 && signature[2] == 0xFF,
                "image/png" => read >= 8 && signature.SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
                _ => false
            };
        }
        finally
        {
            content.Position = originalPosition;
        }
    }
}
