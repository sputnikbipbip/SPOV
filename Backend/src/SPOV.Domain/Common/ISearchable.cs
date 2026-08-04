namespace SPOV.Domain.Common;

public interface ISearchable
{
    static abstract IReadOnlyCollection<string> SearchableProperties { get; }
}
