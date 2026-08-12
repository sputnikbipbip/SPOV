using SPOV.Domain.Specifications;

namespace SPOV.Application.Common;

public static class PagedResponseBuilder
{
    public static PagedResponse<T> From<T>(PagedResult<T> paged)
    {
        return new PagedResponse<T>
        {
            Data = paged.Items,
            PageNumber = paged.PageNumber,
            PageSize = paged.PageSize,
            TotalRecords = paged.TotalRecords,
            TotalPages = (int)Math.Ceiling(paged.TotalRecords / (double)paged.PageSize)
        };
    }
}