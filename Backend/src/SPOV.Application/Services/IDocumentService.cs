using SPOV.Application.Common;
using SPOV.Application.DTOs.Documents;
using SPOV.Domain.Common;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public interface IDocumentService
{
    Task<Result<PagedResponse<DocumentDto>>> GetDocumentsAsync(
        string userId,
        bool isAdmin,
        QueryFilter queryFilter,
        CancellationToken ct = default);
}
