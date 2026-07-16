using Microsoft.AspNetCore.Mvc;
using SPOV.Application.DTOs.Contacts;
using SPOV.Application.Services;
using SPOV.WebApi.Extensions;

namespace SPOV.WebApi.Controllers;

[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactsController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateContactRequest request)
    {
        var result = await _contactService.CreateAsync(request);

        if (result.IsSuccess && result.Data is not null)
            return Created($"/api/contacts/{result.Data.Id}", result.Data);

        return result.ToActionResult();
    }
}
