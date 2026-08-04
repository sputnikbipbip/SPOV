namespace SPOV.Domain.Specifications;

public record PagedResult<T>(IReadOnlyList<T> Items, int TotalRecords, int PageNumber, int PageSize);
