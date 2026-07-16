using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IContactRepository
{
    Task<ContactMessage> AddAsync(ContactMessage message);
}
