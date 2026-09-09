using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Payments;
using SPOV.Application.Services;
using SPOV.Domain.Enums;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/partners/{partnerId}/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly IPartnerService _partnerService;

    public PaymentsController(IPaymentService paymentService, IPartnerService partnerService)
    {
        _paymentService = paymentService;
        _partnerService = partnerService;
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetByPartner(int partnerId)
    {
        var result = await _paymentService.GetByPartnerIdAsync(partnerId);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpPost("~/api/partners/me/payment-proof")]
    [RequestSizeLimit(11 * 1024 * 1024)]
    public async Task<IActionResult> UploadProof(IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null)
            return BadRequest(new { error = "Selecione um comprovativo para enviar." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var partnerResult = await _partnerService.GetByUserIdAsync(userId);
        if (!partnerResult.IsSuccess || partnerResult.Data is null)
            return Unauthorized(new { error = "Perfil de sócio não encontrado." });

        await using var content = file.OpenReadStream();
        var result = await _paymentService.UploadProofAsync(
            partnerResult.Data.Id,
            content,
            file.FileName,
            file.ContentType,
            file.Length,
            cancellationToken);

        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{paymentId}/verify")]
    public async Task<IActionResult> Verify(int partnerId, int paymentId)
    {
        var reviewerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (reviewerId is null)
            return Unauthorized();
        var result = await _paymentService.ReviewAsync(partnerId, paymentId, true, reviewerId, null);
        return result.ToActionResult();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{paymentId}/reject")]
    public async Task<IActionResult> Reject(int partnerId, int paymentId, RejectPaymentRequest request)
    {
        var reviewerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (reviewerId is null)
            return Unauthorized();
        var result = await _paymentService.ReviewAsync(partnerId, paymentId, false, reviewerId, request.Note);
        return result.ToActionResult();
    }

    [Authorize]
    [HttpGet("{paymentId}/proof")]
    public async Task<IActionResult> DownloadProof(int partnerId, int paymentId, CancellationToken cancellationToken)
    {
        if (!await CanAccessPartnerAsync(partnerId))
            return Forbid();

        var result = await _paymentService.GetProofAsync(partnerId, paymentId, cancellationToken);
        if (result.IsFailure)
            return result.ToActionResult();

        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return File(result.Data!.Content, result.Data.ContentType, result.Data.FileName);
    }

    private async Task<bool> CanAccessPartnerAsync(int partnerId)
    {
        if (User.IsInRole(Roles.Administrator))
            return true;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return false;

        var partnerResult = await _partnerService.GetByUserIdAsync(userId);
        return partnerResult.IsSuccess && partnerResult.Data?.Id == partnerId;
    }
}
