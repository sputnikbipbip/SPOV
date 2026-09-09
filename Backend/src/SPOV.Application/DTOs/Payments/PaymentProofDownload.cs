namespace SPOV.Application.DTOs.Payments;

public sealed record PaymentProofDownload(Stream Content, string FileName, string ContentType);
