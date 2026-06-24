using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SPOV_Backend.Models;
using SPOV_Backend.Services;

namespace SPOV_Backend.Controllers;

[ApiController]
[Authorize(Policy = "PartnerOrAdmin")]
[Route("api/documents")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService documentService;
    private readonly IWebHostEnvironment env;

    public DocumentsController(IDocumentService documentService, IWebHostEnvironment env)
    {
        this.documentService = documentService;
        this.env = env;
    }

    [HttpGet(Name = "GetDocuments")]
    public async Task<ActionResult<List<SharedDocument>>> GetDocuments()
    {
        return await documentService.GetDocumentsAsync(User);
    }

    [HttpPost(Name = "UploadDocument")]
    [IgnoreAntiforgeryToken]
    public async Task<ActionResult<SharedDocument>> UploadDocument(IFormFile file, [FromForm] string? category)
    {
        var document = await documentService.UploadDocumentAsync(file, category, User, env);
        return Created($"/api/documents/{document.Id}", document);
    }
}