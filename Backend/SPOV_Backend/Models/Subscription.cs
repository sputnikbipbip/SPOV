using System.ComponentModel.DataAnnotations;

namespace SPOV_Backend.Models;

public class Subscription
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser? User { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public bool IsActive => DateTime.UtcNow >= StartDate && DateTime.UtcNow <= EndDate;
}
