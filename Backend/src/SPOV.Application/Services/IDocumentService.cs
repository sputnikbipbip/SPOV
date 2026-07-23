using SPOV.Application.DTOs.Documents;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IDocumentService
{
    Task<Result<List<DocumentDto>>> GetDocumentsAsync(string userId, bool isAdmin);
}
