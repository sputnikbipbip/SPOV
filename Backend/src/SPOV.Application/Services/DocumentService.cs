using AutoMapper;
using SPOV.Application.DTOs.Documents;
using SPOV.Domain.Common;
using SPOV.Domain.Interfaces;

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

    public async Task<Result<List<DocumentDto>>> GetDocumentsAsync(string userId, bool isAdmin)
    {
        var documents = isAdmin
            ? await _documentRepository.GetAllAsync()
            : await _documentRepository.GetByOwnerIdAsync(userId);

        return Result<List<DocumentDto>>.Success(_mapper.Map<List<DocumentDto>>(documents));
    }
}
