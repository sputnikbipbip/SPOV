using Microsoft.AspNetCore.Identity;

namespace SPOV_Backend.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
}
