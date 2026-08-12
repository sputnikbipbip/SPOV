namespace SPOV.Domain.Specifications;

public class QueryFilter
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public string? Search { get; set; }
    public string? MembershipStatus { get; set; }
}
