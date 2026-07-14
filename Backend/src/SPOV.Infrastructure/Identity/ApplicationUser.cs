using Microsoft.AspNetCore.Identity;

namespace SPOV.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}
