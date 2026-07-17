using SPOV.Application.DTOs.Events;
using SPOV.Domain.Common;

namespace SPOV.Application.Services;

public interface IEventService
{
    Task<Result<List<EventDto>>> GetAllAsync();
    Task<Result<EventDto?>> GetByIdAsync(int id);
    Task<Result<EventDto>> CreateAsync(CreateEventRequest request);
    Task<Result<EventDto>> UpdateAsync(int id, UpdateEventRequest request);
    Task<Result> DeleteAsync(int id);
}
