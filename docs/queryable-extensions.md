# Queryable Extensions — Generic Search, Sort & Pagination

This document explains the generic query helpers in
`Backend/src/SPOV.Application/Common/QueryableExtensions.cs` and the
`ISearchable` interface in `Backend/src/SPOV.Domain/Common/ISearchable.cs`.

## Motivation

The original `ApplySearch` was hard-coded to a `Movie` entity that does not exist
in this codebase (it did not even compile), and `ApplySort` relied on
`System.Linq.Dynamic.Core` in a way that failed to build (`CS0411`). Both methods
were unused and blocked the entire solution from compiling.

The goal was to make `ApplySearch` **generic** — reusable by any entity — using a
combination of:

1. **Expression trees** to build the query predicate safely at runtime, and
2. An **`ISearchable` interface** so entities declare their own searchable fields
   with no boilerplate at the call site.

A by-product was rewriting `ApplySort` with expression trees, removing the broken
third-party dependency.

## The three helpers

| Method | Signature | Purpose |
| --- | --- | --- |
| `ApplyPagination` | `(IQueryable<T>, int pageNumber, int pageSize)` | `Skip`/`Take` paging |
| `ApplySort` | `(IQueryable<T>, string? sortBy) where T : class` | `ORDER BY` from a `"prop [desc]"` list |
| `ApplySearch` | `(IQueryable<T>, string? search, params Expression<Func<T, string?>>[])` | Case-insensitive `LIKE`-style filter over given fields |
| `ApplySearch` | `(IQueryable<T>, string? search) where T : ISearchable` | Same, but fields come from the entity itself |

They compose because they all operate on `IQueryable<T>` and return
`IQueryable<T>`, so they can be chained:

```csharp
var page = query
    .ApplySearch(filter.Search)
    .ApplySort(filter.SortBy)
    .ApplyPagination(filter.PageNumber, filter.PageSize);
```

## The `ISearchable` interface

```csharp
namespace SPOV.Domain.Common;

public interface ISearchable
{
    static abstract IReadOnlyCollection<string> SearchableProperties { get; }
}
```

- It uses a **static abstract** property so the list of searchable fields belongs
  to the *type*, not to any instance — no need to instantiate an entity to ask it
  which fields it exposes for search.
- `static abstract` members are supported on .NET 7+ / C# 11 (the project uses
  `LangVersion 13`), and the compiler forces every implementing type to declare
  the member — you cannot forget it.

Entities opt in by implementing the interface:

```csharp
public class Partner : ISearchable
{
    public static IReadOnlyCollection<string> SearchableProperties { get; } =
        [nameof(FullName), nameof(Email), nameof(Phone), nameof(TaxId),
         nameof(City), nameof(Country), nameof(Profession), nameof(CompanyName)];

    // ... entity properties
}
```

Currently implemented by: `Partner`, `Article`, `NewsPost`, `Event`.

## How `ApplySearch` works

### Overload 1 — explicit expression fields

```csharp
public static IQueryable<T> ApplySearch<T>(
    this IQueryable<T> query,
    string? search,
    params Expression<Func<T, string?>>[] searchFields)
```

- Returns the query untouched when `search` is null/whitespace or no fields are given.
- Otherwise delegates to `BuildSearchPredicate`, which composes a single
  `Expression<Func<T, bool>>` and passes it to `query.Where(...)`.

### Overload 2 — `ISearchable`

```csharp
public static IQueryable<T> ApplySearch<T>(this IQueryable<T> query, string? search)
    where T : ISearchable
```

- Reads `T.SearchableProperties` and converts each property name into a typed
  field selector via `BuildFieldSelector<T>` (`Expression.Property` on a fresh
  parameter).
- Then calls overload 1 with those selectors.

### `BuildSearchPredicate` — the expression-tree engine

For every searchable field it builds the expression:

```
(field != null && field.ToLowerInvariant().Contains(search.ToLowerInvariant()))
```

and `OR`s them together:

- **Case-insensitive:** both sides are normalized with `ToLowerInvariant()`, so
  searching `"design"` matches `"Design Patterns"`.
- **Null-safe:** `string?` fields (e.g. `Partner.TaxId`) are guarded with
  `field != null` and the `&&` short-circuits, so in-memory execution never
  throws a `NullReferenceException` and SQL produces `LOWER(x) LIKE ...` semantics.
- **OR composition:** each field's match expression is combined with
  `Expression.OrElse`.
- **EF Core friendly:** every call is over the existing `IQueryable<T>`, so the
  whole predicate is translated to SQL by EF Core when the query hits the
  database; nothing materializes the query in memory first.

### Why a `ParameterReplacerVisitor`?

Each caller-provided field selector is a self-contained lambda with its **own**
parameter (`a => a.Title` uses parameter `a`). To merge several selectors into one
`Where(predicate)` you need a single shared parameter. The visitor rewrites every
body so the source parameter of each selector is replaced with one common
parameter:

```csharp
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
```

This is the standard "expression rewriter" pattern: `Visit` the body, swap
parameters, then use the rewritten bodies to build the final lambda.

## How `ApplySort` works

`ApplySort` accepts a comma-separated list of `property [asc|desc]` tokens, e.g.
`"fullName asc, joinedAt desc"`:

1. **Whitelist:** only public instance properties of `T` are accepted (compared
   case-insensitively). Unknown tokens are ignored — an untrusted `sortBy` can
   never become arbitrary SQL or reflection.
2. **Ordering:** for each valid token it builds a key-selector
   (`Expression.Property(parameter, name)`) and invokes the right
   `Queryable.OrderBy` / `OrderByDescending` (first) or `ThenBy` /
   `ThenByDescending` (subsequent) method via reflection, so multiple sort keys
   are applied in order and stay stable.
3. No longer depends on `System.Linq.Dynamic.Core`.

## Usage examples

Search everything the entity declares:

```csharp
var partners = _context.Partners
    .ApplySearch(request.Search)
    .ToListAsync(cancellationToken);
```

Search only specific fields on any type:

```csharp
var posts = _context.NewsPosts
    .ApplySearch(term, n => n.Title, n => n.Body);
```

Full pipeline:

```csharp
var page = _context.Events
    .ApplySearch(filter.Search)
    .ApplySort(filter.SortBy)
    .ApplyPagination(filter.PageNumber, filter.PageSize);
```

## Adding search to a new entity

1. Implement `ISearchable` on the entity and declare its searchable fields:
   ```csharp
   public class ContactMessage : ISearchable
   {
       public static IReadOnlyCollection<string> SearchableProperties { get; } =
           [nameof(Name), nameof(Email), nameof(Subject)];
       // ...
   }
   ```
2. That's it — `query.ApplySearch(term)` now works for `ContactMessage`.
   (Use the `params Expression` overload when the type is not `ISearchable`, or
   when you want a different field set on a given call.)

## Gotchas & design decisions

- **Overload resolution shadowing:** for a type that implements `ISearchable`,
  `query.ApplySearch(term)` resolves to the `ISearchable` overload, *not* the
  `params` overload — a call with no explicit fields searches the entity's
  declared properties. If you ever need "no fields at all", pass an explicit
  empty set or use a non-`ISearchable` type.
- **`ToLowerInvariant` vs `EF.Functions.ILike`:** `ILike` is PostgreSQL-specific
  and requires EF Core in the `SPOV.Application` project (which intentionally has
  none). The `ToLowerInvariant().Contains(...)` approach works on LINQ to Objects
  (so tests run against in-memory lists) and translates to `LOWER()`/`LIKE` in
  SQL. If you later need accent-insensitive or PG-optimized matching, swap the
  body inside `BuildSearchPredicate` for `EF.Functions.ILike` and add the EF Core
  package reference.
- **Static fields are not EF-mapped:** adding `static` members to entities has no
  effect on the EF model or migrations.
- **`TreatWarningsAsErrors` / nullable:** the project treats nullable warnings as
  errors (`WarningsAsErrors=nullable`), which is why `ApplySort` returns
  `ordered!`. Keep expression code null-annotated.

## Tests

Coverage lives in
`Backend/SPOV_Backend.Tests/Application/Common/QueryableExtensionsTests.cs`
(13 tests) and covers:

- Case-insensitive matching across multiple fields
- Matching the second field when the first does not
- No-match → empty result
- Null/whitespace search → original query untouched
- No search fields → original query untouched (non-`ISearchable` type)
- Null field values do not throw
- `ISearchable` overload searches declared properties
- Sorting asc/desc, ignoring unknown properties, whitespace passthrough

Run them with:

```bash
dotnet test Backend/SPOV_Backend.Tests/SPOV_Backend.Tests.csproj --filter "FullyQualifiedName~QueryableExtensionsTests"
```

## Files touched

| File | Change |
| --- | --- |
| `src/SPOV.Domain/Common/ISearchable.cs` | New `ISearchable` interface |
| `src/SPOV.Application/Common/QueryableExtensions.cs` | Generic `ApplySearch` (2 overloads), expression-tree `ApplySort`, `ApplyPagination` unchanged |
| `src/SPOV.Domain/Entities/{Partner,Article,NewsPost,Event}.cs` | Implement `ISearchable` |
| `SPOV_Backend.Tests/Application/Common/QueryableExtensionsTests.cs` | New test suite |
