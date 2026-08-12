using AutoMapper;
using SPOV.Application.Common;
using SPOV.Application.DTOs.Documents;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;
using SPOV.Domain.Specifications;

namespace SPOV.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IMapper _mapper;

    public DocumentService(
        IDocumentRepository documentRepository,
        IMapper mapper)
    {
        _documentRepository = documentRepository;
        _mapper = mapper;
    }

    public async Task<Result<PagedResponse<DocumentDto>>> GetDocumentsAsync(
        string userId,
        bool isAdmin,
        QueryFilter queryFilter,
        CancellationToken ct)
    {
        var paged = isAdmin
            ? await _documentRepository.GetAllAsync(queryFilter, ct)
            : await _documentRepository.GetByOwnerIdAsync(userId, queryFilter, ct);

        var items = _mapper.Map<List<DocumentDto>>(paged.Items);

        return Result<PagedResponse<DocumentDto>>.Success(
            PagedResponseBuilder.From(new PagedResult<DocumentDto>(items, paged.TotalRecords, paged.PageNumber, paged.PageSize)));
    }
}
