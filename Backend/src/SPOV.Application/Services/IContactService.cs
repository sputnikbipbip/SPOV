using SPOV.Application.DTOs.Contacts;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IContactService
{
    Task<Result<ContactMessageDto>> CreateAsync(CreateContactRequest request);
}
