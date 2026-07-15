using SPOV.Domain.Enums;

namespace SPOV.Domain.Entities;

public class AdminUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public AdminRole Role { get; set; } = AdminRole.Staff;
}
