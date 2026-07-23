using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV.Application.Services;
using SPOV.Domain.Enums;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Authorize(Policy = "PartnerOrAdmin")]
[Route("api/documents")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet(Name = "GetDocuments")]
    public async Task<IActionResult> GetDocuments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole(Roles.Administrator);
        var result = await _documentService.GetDocumentsAsync(userId, isAdmin);
        return result.ToActionResult();
    }
}
