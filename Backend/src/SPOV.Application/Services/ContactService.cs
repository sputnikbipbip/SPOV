using AutoMapper;
using SPOV.Application.DTOs.Contacts;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using SPOV.Domain.Interfaces;

namespace SPOV.Application.Services;

public class ContactService : IContactService
{
    private readonly IContactRepository _contactRepository;
    private readonly IMapper _mapper;

    public ContactService(IContactRepository contactRepository, IMapper mapper)
    {
        _contactRepository = contactRepository;
        _mapper = mapper;
    }

    public async Task<Result<ContactMessageDto>> CreateAsync(CreateContactRequest request)
    {
        var message = new ContactMessage
        {
            Name = request.Name,
            Email = request.Email,
            Subject = request.Subject,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _contactRepository.AddAsync(message);
        var dto = _mapper.Map<ContactMessageDto>(created);
        return Result<ContactMessageDto>.Success(dto);
    }
}
