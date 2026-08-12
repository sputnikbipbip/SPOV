using System.Linq.Expressions;
using System.Reflection;
using SPOV.Domain.Common;

namespace SPOV.Application.Common;

public static class QueryableExtensions
{
    public static IQueryable<T> ApplyPagination<T>(this IQueryable<T> query, int pageNumber, int pageSize)
    {
        return query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);
    }

    public static IQueryable<T> ApplySort<T>(this IQueryable<T> query, string? sortBy) where T : class
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return query;

        var allowedProperties = typeof(T)
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Select(p => p.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var sortExpressions = new List<(string Name, bool Descending)>();

        foreach (var part in sortBy.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var tokens = part.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (tokens.Length == 0 || !allowedProperties.Contains(tokens[0]))
                continue;

            var descending = tokens.Length > 1 && tokens[1].Equals("desc", StringComparison.OrdinalIgnoreCase);
            sortExpressions.Add((tokens[0], descending));
        }

        if (sortExpressions.Count == 0)
            return query;

        IOrderedQueryable<T>? ordered = null;
        foreach (var (propertyName, descending) in sortExpressions)
        {
            var parameter = Expression.Parameter(typeof(T), "entity");
            var member = Expression.Property(parameter, propertyName);
            var keySelector = Expression.Lambda(member, parameter);

            var methodName = ordered is null
                ? descending ? nameof(Queryable.OrderByDescending) : nameof(Queryable.OrderBy)
                : descending ? nameof(Queryable.ThenByDescending) : nameof(Queryable.ThenBy);

            var method = typeof(Queryable)
                .GetMethods()
                .First(m => m.Name == methodName && m.GetParameters().Length == 2)
                .MakeGenericMethod(typeof(T), member.Type);

            ordered = (IOrderedQueryable<T>)method.Invoke(null, [ordered ?? query, keySelector])!;
        }

        return ordered!;
    }

    public static IQueryable<T> ApplySearch<T>(
        this IQueryable<T> query,
        string? search,
        params Expression<Func<T, string?>>[] searchFields)
    {
        if (string.IsNullOrWhiteSpace(search) || searchFields.Length == 0)
            return query;

        var predicate = BuildSearchPredicate(search, searchFields);
        return query.Where(predicate);
    }

    public static IQueryable<T> ApplySearch<T>(this IQueryable<T> query, string? search)
        where T : ISearchable
    {
        if (string.IsNullOrWhiteSpace(search))
            return query;

        var searchFields = T.SearchableProperties
            .Select(propertyName => BuildFieldSelector<T>(propertyName))
            .ToArray();

        return searchFields.Length == 0
            ? query
            : ApplySearch(query, search, searchFields);
    }

    private static Expression<Func<T, string?>> BuildFieldSelector<T>(string propertyName)
    {
        var parameter = Expression.Parameter(typeof(T), "entity");
        return Expression.Lambda<Func<T, string?>>(Expression.Property(parameter, propertyName), parameter);
    }

    private static Expression<Func<T, bool>> BuildSearchPredicate<T>(
        string search,
        IEnumerable<Expression<Func<T, string?>>> searchFields)
    {
        var parameter = Expression.Parameter(typeof(T), "entity");
        var normalizedTerm = search.ToLower();

        Expression? body = null;

        foreach (var field in searchFields)
        {
            var fieldBody = new ParameterReplacerVisitor(field.Parameters[0], parameter).Visit(field.Body)!;

            var normalizedField = Expression.Call(
                fieldBody,
                typeof(string).GetMethod(nameof(string.ToLower), Type.EmptyTypes)!);

            var contains = Expression.Call(
                normalizedField,
                typeof(string).GetMethod(nameof(string.Contains), [typeof(string)])!,
                Expression.Constant(normalizedTerm));

            var notNull = Expression.NotEqual(fieldBody, Expression.Constant(null, typeof(string)));
            var match = Expression.AndAlso(notNull, contains);

            body = body is null ? match : Expression.OrElse(body, match);
        }

        return Expression.Lambda<Func<T, bool>>(body!, parameter);
    }

    private sealed class ParameterReplacerVisitor : ExpressionVisitor
    {
        private readonly ParameterExpression _source;
        private readonly ParameterExpression _target;

        public ParameterReplacerVisitor(ParameterExpression source, ParameterExpression target)
        {
            _source = source;
            _target = target;
        }

        protected override Expression VisitParameter(ParameterExpression node) =>
            node == _source ? _target : base.VisitParameter(node);
    }
}
