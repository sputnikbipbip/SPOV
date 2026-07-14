using AutoMapper;
using SPOV.Application.Common.Interfaces;
using SPOV.Application.DTOs.Documents;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMapper _mapper;

    public DocumentService(
        IDocumentRepository documentRepository,
        IFileStorageService fileStorageService,
        IMapper mapper)
    {
        _documentRepository = documentRepository;
        _fileStorageService = fileStorageService;
        _mapper = mapper;
    }

    public async Task<Result<List<DocumentDto>>> GetDocumentsAsync(string userId, bool isAdmin)
    {
        var documents = isAdmin
            ? await _documentRepository.GetAllAsync()
            : await _documentRepository.GetByOwnerIdAsync(userId);

        return Result<List<DocumentDto>>.Success(_mapper.Map<List<DocumentDto>>(documents));
    }

    public async Task<Result<DocumentDto>> UploadDocumentAsync(
        Stream fileStream, string fileName, string? category, string ownerId)
    {
        var filePath = await _fileStorageService.SaveFileAsync(fileName, fileStream);

        var document = new SharedDocument
        {
            FileName = fileName,
            FilePath = filePath,
            Category = category,
            OwnerId = ownerId
        };

        var created = await _documentRepository.AddAsync(document);
        return Result<DocumentDto>.Success(_mapper.Map<DocumentDto>(created));
    }
}
